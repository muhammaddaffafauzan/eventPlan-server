import User from "../models/UsersModel.js";
import Profile from "../models/ProfileModel.js";
import Followers from "../models/FollowersModel.js";
import Event from "../models/EventModel.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { Op } from "sequelize";
import nodemailer from "nodemailer";

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
    const { identifier, password } = req.body;

    // Find user based on email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcryptjs.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Password wrong" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        msg: "User not verified. Check your email for verification instructions.",
      });
    }

    // If authentication is successful, generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);
    const role = user.role;

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, role });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD, // Ganti dengan kata sandi email Anda
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to EventPlan! Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f4f4f4;">
            <img src='https://i.postimg.cc/zVskvwHM/eventplan-logo.png' alt='EventPlan Logo' style="width: 100%; max-height: 150px; object-fit: contain; margin-bottom: 20px;">
          <h2 style="color: #333; text-align: center;">Welcome to EventPlan</h2>
          <p style="color: #555; font-size: 16px;">Thank you for choosing EventPlan! To get started, please verify your email address:</p>
          <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; margin-top: 15px;">
            <h3 style="color: #333; text-align: center; font-size: 24px;">${verificationCode}</h3>
          </div>
          <p style="color: #555; font-size: 16px; text-align: center; margin-top: 15px;">This code will expire in a limited time.</p>
          <p style="color: #555; font-size: 16px; text-align: center;">Thank you for choosing EventPlan!</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export const registerUser = async (req, res) => {
  const { username, email, firstName, lastName, password, confPassword } = req.body;

  // Validasi password
  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password and confirmation password do not match" });
  }
  // Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    // Cek apakah email telah digunakan
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt();
    const hashPassword = await bcryptjs.hash(password, salt);

    // Buat pengguna baru
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashPassword,
      role: "user",
    });

    const newProfile = await Profile.create({
      userId: newUser.id,
      firstName,
      lastName
    });

    // Buat token verifikasi
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // Kode enam digit
    newUser.verificationToken = verificationToken;
    await newUser.save();

    // Kirim email verifikasi
    await sendVerificationEmail(newUser.email, verificationToken);

    // Respon sukses
    const newUserWithoutPassword = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      newProfile,
    };

    res.status(201).json({
      msg: "Register account successfully. Check your email for verification instructions.",
      newUser: newUserWithoutPassword,
    });
  } catch (error) {
    // Tangani kesalahan
    if (error.message.includes("Error sending email")) {
      return res.status(500).json({ msg: "Error sending verification email" });
    }
    res.status(500).json({ msg: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
        verificationToken: verificationToken,
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    // Setel status verifikasi dan hapus kode verifikasi
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // If authentication is successful, generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);
    const role = user.role;

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();
    // Mengirimkan respon dengan access token dan role
    res.status(200).json({ accessToken, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    // Ambil data pengguna berdasarkan alamat email
    const user = await User.findOne({
      where: {
        email: req.body.email,
        role: "user", // Pastikan hanya pengguna dengan peran 'user' yang dapat meminta ulang kode verifikasi
      },
    });

    // Cek apakah pengguna ditemukan
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Cek apakah pengguna sudah terverifikasi
    if (user.isVerified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    // Generate kode verifikasi baru
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);

    // Simpan kode verifikasi baru ke dalam database
    user.verificationToken = newVerificationCode;
    await user.save();

    // Kirim email verifikasi baru
    await sendVerificationEmail(user.email, newVerificationCode);

    res.json({
      msg: `Verification code resent successfully, check email ${user.email}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const Me = async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization.split(" ")[1];

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
      attributes: ["id", "uuid", "username", "email", "role", "createdAt"],
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

    // Hitung jumlah event yang dimiliki oleh user
    const eventCount = await Event.count({
      where: {
        userId: user.id,
      },
    });

    const responseAll = {
      user,
      profile,
      followersCount,
      followingCount,
      eventCount, // Menambahkan eventCount ke respons
    };

    res.status(200).json(responseAll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    // Cek apakah email pengguna ada dalam database dan telah terverifikasi
    const user = await User.findOne({
      where: {
        email: req.body.email,
        isVerified: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User not found or email not verified" });
    }

    // Generate reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit reset token

    // Simpan reset token dalam database
    user.verificationToken = resetToken;
    await user.save();

    // Kirim email reset password
    await sendVerificationEmail(user.email, resetToken);

    res.json({ msg: "Password reset instructions sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const verificationTokenForResetPassword = async (req, res) => {
  try {
    const { verificationToken, newPassword, confPassword, email } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
        verificationToken: verificationToken,
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid reset token" });
    }

    // Validasi password baru dan konfirmasi password
    if (newPassword !== confPassword) {
      return res
        .status(400)
        .json({ msg: "New password and confirmation password do not match" });
    }

    // Reset verification token in database
    user.verificationToken = null;
    await user.save();

    // Hash password baru
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Simpan password baru ke dalam database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
// Fungsi untuk mengirim ulang kode reset password via email
export const resendCodeEmailForgotPassword = async (req, res) => {
  try {
    // Cari pengguna berdasarkan alamat email
    const user = await User.findOne({
      where: {
        email: req.body.email,
        isVerified: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User not found or email not verified" });
    }

    // Generate kode reset baru
    const newResetToken = Math.floor(100000 + Math.random() * 900000);

    // Simpan kode reset baru ke dalam database
    user.verificationToken = newResetToken;
    await user.save();

    // Kirim email reset password
    await sendVerificationEmail(user.email, newResetToken);

    res.json({ msg: "Reset code resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;
  const userId = req.userId;

  // Validasi password baru
  if (newPassword !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password and confirmation password do not match" });
  }

  try {
    // Cari pengguna berdasarkan ID pengguna
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Periksa apakah oldPassword cocok dengan password di database
    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Hash password baru
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Simpan password baru
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.userId;

  try {
    // Cari pengguna berdasarkan ID pengguna
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verifikasi password
    if (!password || !user.password) {
      return res
        .status(400)
        .json({ msg: "Invalid password or user password is missing" });
    }
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Password is incorrect" });
    }

    // Cek apakah email baru sudah digunakan oleh pengguna lain
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Buat token verifikasi untuk email baru
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // Kode enam digit
    user.verificationToken = verificationToken;
    await user.save();

    // Kirim email verifikasi
    await sendVerificationEmail(newEmail, verificationToken);

    res.status(200).json({
      msg: "Verification email sent to your new email address. Please check your email inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const verificationTokenForChangeEmail = async (req, res) => {
  const { verificationToken, newEmail } = req.body;
  const userId = req.userId;

  try {
    // Cari pengguna berdasarkan ID pengguna
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Validasi token verifikasi untuk email baru
    if (user.verificationToken !== verificationToken) {
      return res
        .status(400)
        .json({ msg: "Invalid verification token for email change" });
    }

    // Validasi format email baru
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    // Simpan email baru ke dalam data pengguna
    user.email = newEmail; // Menggunakan email baru yang disimpan sebelumnya
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ msg: "Email changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const resendCodeForChangeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.userId;

  try {
    // Cari pengguna berdasarkan ID pengguna
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verifikasi password
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Password is incorrect" });
    }

    // Buat token verifikasi baru untuk email baru
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // Kode enam digit
    user.verificationToken = verificationToken;
    await user.save();

    // Kirim ulang email verifikasi
    await sendVerificationEmail(newEmail, verificationToken);

    res.status(200).json({
      msg: "New verification email sent to your new email address. Please check your email inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};