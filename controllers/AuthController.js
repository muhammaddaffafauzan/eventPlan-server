import User from "../models/UsersModel.js";
import Profile from "../models/ProfileModel.js";
import Followers from "../models/FollowersModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Fungsi untuk menghasilkan token akses dan refresh token
const generateTokens = (user) => {
  // Membuat token akses dengan menggunakan user information
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET, // Menggunakan secret key dari environment variable
    { expiresIn: "1h" } // Token akses kadaluwarsa setelah 1 jam (bisa disesuaikan)
  );

  // Membuat token refresh dengan menggunakan user information
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET, // Menggunakan secret key khusus untuk refresh token
    { expiresIn: "7d" } // Token refresh kadaluwarsa setelah 7 hari (bisa disesuaikan)
  );

  // Mengembalikan objek yang berisi token akses dan refresh token
  return { accessToken, refreshToken };
};


export const Login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await bcryptjs.compare(req.body.password, user.password);

    if (!match) return res.status(400).json({ msg: "Password wrong" });

    // Jika otentikasi berhasil, buat token akses dan refresh token
    const { accessToken, refreshToken } = generateTokens(user);
    const role = user.role;
    // Simpan refresh token di database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, role });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const Me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.userId,
      },
      attributes: ["id", "uuid", "username", "email", "role"],
    });

    const profile = await Profile.findOne({
      where: {
        userId: user.id,
      },
    });

    // Hitung jumlah pengikut user
    const followersCount = await Followers.count({
      where: {
        followingId: user.id,
      },
    });

    // Hitung jumlah yang diikuti oleh user
    const followingCount = await Followers.count({
      where: {
        followerId: user.id,
      },
    });

    const responseAll = {
      user,
      profile,
      followersCount,
      followingCount,
    };

    res.status(200).json(responseAll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
