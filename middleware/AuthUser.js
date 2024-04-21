import User from "../models/UsersModel.js";
import jwt from "jsonwebtoken";

export const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Token not found, authentication failed" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ msg: "Token invalid" });
    }

    try {
      const user = await User.findOne({ where: { id: decodedToken.userId } });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check if user role is admin
      if (user.role === "admin" || user.role === "super admin") {
        req.userId = user.id;
        req.role = user.role;
        req.email = user.email;
        next();
      } else {
        // If not admin or super admin, perform email verification
        if (!user.isVerified) {
          return res.status(403).json({ msg: "Email not verified" });
        }

        req.userId = user.id;
        req.role = user.role;
        req.email = user.email;
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  });
};

export const adminOnly = async (req, res, next) => {
  try {
    if (!req.userId || !req.role) {
      return res.status(401).json({ msg: "Token invalid" });
    }

    if (req.role !== "admin" && req.role !== "super admin") {
      return res.status(403).json({ msg: "Forbidden access" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Token invalid" });
  }
};

export const superAdminOnly = async (req, res, next) => {
  try {
    // Check if userId and role exist in the req object
    if (!req.userId || !req.role) {
      return res.status(401).json({ msg: "Token invalid" });
    }

    // Check if user role is "super admin"
    if (req.role !== "super admin") {
      return res.status(403).json({ msg: "Forbidden access" });
    }

    // If role is "super admin", proceed to the next middleware
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Token invalid" });
  }
};
