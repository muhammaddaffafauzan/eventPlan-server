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
    { expiresIn: "7d" } // Token akses kadaluwarsa setelah 1 jam (bisa disesuaikan)
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

export const registerUser = async (req, res) => {
  const { username, email, password, confPassword } = req.body;

  // Check if password and confirmation password match
  if (password !== confPassword) {
    return res.status(400).json({ msg: 'Password and confirmation password do not match' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }

    // Hash the password
    const salt = await bcryptjs.genSalt();
    const hashPassword = await bcryptjs.hash(password, salt);

    // Create a new user
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashPassword,
      role: "user",
    });

    // Omit the password from the response
    const newUserWithoutPassword = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      // Add other attributes as needed
    };

    res.status(201).json({
      msg: "Register account successfully",
      newUser: newUserWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const Me = async (req, res) => {
  try {
     // Get the token from the request headers
     const token = req.headers.authorization.split(' ')[1];

     // Verify the token
     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
 
     // Check if the token is still valid
     const currentTime = new Date().getTime();
     if (decodedToken.exp * 1000 < currentTime) {
       return res.status(403).json({ msg: "Token expired" });
     }
 
    const user = await User.findOne({
      where: {
        id: req.userId,
      },
      attributes: ["id", "uuid", "username", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

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

