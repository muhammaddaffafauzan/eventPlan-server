import User from "../models/UsersModel.js";
import jwt from "jsonwebtoken";

export const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Token tidak ditemukan, otentikasi gagal" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ msg: "Token tidak valid" });
    }

    try {
      const user = await User.findOne({ where: { id: decodedToken.userId } });
      if (!user) {
        return res.status(404).json({ msg: "User tidak ditemukan" });
      }

      // Tambahkan pengecekan jika peran pengguna adalah admin
      if (user.role === "admin") {
        req.userId = user.id;
        req.role = user.role;
        next();
      } else {
        // Jika bukan admin, lakukan verifikasi email
        if (!user.isVerified) {
          return res.status(403).json({ msg: "Email belum diverifikasi" });
        }

        req.userId = user.id;
        req.role = user.role;
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
  });
};

export const adminOnly = async (req, res, next) => {
  try {
    if (!req.userId || !req.role) {
      return res.status(401).json({ msg: "Token tidak valid" });
    }

    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Akses terlarang" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Token tidak valid" });
  }
};
