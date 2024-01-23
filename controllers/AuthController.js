import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Fungsi untuk menghasilkan token akses dan refresh token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Waktu kadaluwarsa refresh token dapat disesuaikan
  );

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

    res.json({ accessToken, refreshToken, role });
  } catch (error) {
    res.status(500).json({msg: error.message});
        console.log(error)
  }
};

export const Me = async (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).json({msg: error.message});
    console.log(error)
  }
};