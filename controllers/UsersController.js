import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import Event from "../models/EventModel.js";
import bcryptjs from "bcryptjs";
import { Op } from "sequelize";
import Event_loc from "../models/EventLocationModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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

const sendTemporaryPasswordEmail = async (email, tempPassword) => {
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
    subject: "Your Temporary Password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f4f4f4;">
        <div style="text-align: center;">
          <img src='https://i.postimg.cc/zVskvwHM/eventplan-logo.png' alt='EventPlan Logo' style="max-height: 100px; object-fit: contain; margin-bottom: 20px;">
        </div>
        <h2 style="color: #333; text-align: center;">Temporary Password</h2>
        <p style="color: #555; font-size: 16px; text-align: center;">Here is your temporary password. Please change it after logging in:</p>
        <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; margin-top: 15px; text-align: center;">
          <h3 style="color: #333; font-size: 24px;">${tempPassword}</h3>
        </div>
        <p style="color: #555; font-size: 16px; text-align: center; margin-top: 15px;">This password is temporary and should be changed immediately after logging in.</p>
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
};

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const response = await User.findAll({
      attributes: [
        "id",
        "uuid",
        "username",
        "email",
        "role",
        "isVerified",
        "createdAt",
      ],
      include: [
        {
          model: Profile,
        },
      ],
      where: {
        id: { [Op.ne]: currentUserId },
      },
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const getUsersById = async (req, res) => {
  try {
    const user = await User.findOne({
      attributes: [
        "uuid",
        "username",
        "email",
        "role",
        "isVerified",
        "createdAt",
      ],
      where: {
        uuid: req.params.uuid,
      },
      include: [
        {
          model: Profile,
        },
        {
          model: Event,
          include: [
            {
              model: Event_loc,
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const createUsers = async (req, res) => {
  const {
    username,
    email,
    firstName,
    lastName,
    password,
    confPassword,
    role,
    isVerified,
  } = req.body;

  // Pastikan email tidak kosong
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    const existingUserEmail = await User.findOne({ where: { email: email } });
    if (existingUserEmail) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    let hashPassword;
    if (role === "admin") {
      // Pastikan password dan konfirmasi password cocok
      if (!password || password !== confPassword) {
        return res
          .status(400)
          .json({
            msg: "Password and confirmation password are required and must match",
          });
      }

      // Hashing password jika peran adalah 'admin'
      const salt = await bcryptjs.genSalt();
      if (!salt) {
        return res.status(500).json({ msg: "Internal Server Error" });
      }
      hashPassword = await bcryptjs.hash(password, salt);
    }

    let newUser;

    if (role === "admin") {
      // Buat pengguna baru dengan peran 'admin'
      newUser = await User.create({
        username: username,
        email: email,
        password: hashPassword,
        role: role,
        isVerified: isVerified,
      });
    } else if (role === "user") {
      // Buat pengguna baru dengan peran 'user', password tidak diperlukan
      newUser = await User.create({
        username: username,
        email: email,
        role: role,
      });
    } else {
      // Peran selain 'admin' dan 'user' tidak didukung
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Buat profil pengguna
    await Profile.create({
      userId: newUser.id,
      firstName: firstName,
      lastName: lastName,
    });

    if (newUser.role === "user") {
      // Jika peran pengguna adalah 'user', kirim email verifikasi
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
      await sendVerificationEmail(newUser.email, newVerificationCode);
      newUser.verificationToken = newVerificationCode;
      await newUser.save(); // Simpan perubahan ke database
    }

    // Tanggapan berhasil
    if (newUser.role === "admin") {
      res
        .status(201)
        .json({ msg: `Created ${newUser.username} account successfully` });
    } else {
      res.status(201).json({
        msg: "Added account successfully. Check user email for verification instructions.",
      });
    }
    console.log("Request body:", req.body);
  } catch (error) {
    // Tanggapan jika terjadi kesalahan
    console.error("Error creating user:", error);
    res.status(400).json({ msg: error.message });
  }
};


export const updateUsersById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { uuid: req.params.uuid },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { name, email, password, confPassword, role } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (password) {
      if (password !== confPassword) {
        return res
          .status(400)
          .json({ msg: "Password and Confirmation Password do not match" });
      }

      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    if (role) updateFields.role = role;

    await User.update(updateFields, { where: { id: user.id } });

    res.status(200).json({ msg: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ msg: error.message });
  }
};

export const verifyEmailAdmin = async (req, res) => {
  try {
    const { email, verificationToken } = req.body;

    // Cari pengguna berdasarkan email dan token verifikasi
    const user = await User.findOne({
      where: {
        email: email,
        verificationToken: verificationToken,
      },
    });

    // Jika pengguna tidak ditemukan, kembalikan respons dengan pesan kesalahan
    if (!user) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    // Setel status verifikasi pengguna menjadi true dan hapus token verifikasi
    user.isVerified = true;
    user.verificationToken = null;

    // Buat temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcryptjs.genSalt();
    const hashPassword = await bcryptjs.hash(tempPassword, salt);
    user.password = hashPassword;

    await user.save();

    // Kirim email temporary password ke pengguna
    await sendTemporaryPasswordEmail(user.email, tempPassword);

    // Kirim respons yang berhasil jika verifikasi berhasil
    res.status(200).json({ msg: `Account ${user.username} has been verified` });
  } catch (error) {
    // Tangani kesalahan jika terjadi
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const resendVerificationCodeAdmin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
        role: "user",
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
    user.verificationToken = newVerificationCode;
    await user.save();

    await sendVerificationEmail(user.email, newVerificationCode);

    res.json({
      msg: `Verification code resent successfully, check email ${user.email}`,
    });
  } catch (error) {
    console.error("Error resending verification code:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const deleteUsers = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  let profile;
  let events;

  if (user.role === "user") {
    profile = await Profile.findOne({
      where: {
        userId: user.id,
      },
    });
    events = await Event.findAll({
      where: {
        userId: user.id,
      },
    });

    if (!profile && !events) {
      return res.status(404).json({ msg: "Profile user and events not found" });
    }

    if (
      profile &&
      fs.existsSync(path.join(__dirname, `../public/images/${profile.image}`))
    ) {
      try {
        fs.unlinkSync(
          path.join(__dirname, `../public/images/${profile.image}`)
        );
      } catch (error) {
        console.error("Error deleting profile image:", error);
      }
    }

    if (events && events.length > 0) {
      events.forEach((event) => {
        if (
          event.image &&
          fs.existsSync(path.join(__dirname, `../public/images/${event.image}`))
        ) {
          try {
            fs.unlinkSync(
              path.join(__dirname, `../public/images/${event.image}`)
            );
          } catch (error) {
            console.error("Error deleting event image:", error);
          }
        }
      });
    }
  }

  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });

    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(400).json({ msg: error.message });
  }
};

export const verifyUserById = async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.uuid } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    return res.status(200).json({
      msg: `User verified successfully. isVerified set to ${user.isVerified}`,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
