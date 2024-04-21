import express from "express";
import {
  getUsers,
  getUsersById,
  createUsers,
  updateUsersById,
  verifyEmailAdmin,
  resendVerificationCodeAdmin,
  deleteUsers,
  verifyUserById,
} from "../controllers/UsersController.js";
import { adminOnly, superAdminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/users/:uuid", verifyUser, adminOnly, getUsersById);
router.post("/users/create", verifyUser, superAdminOnly, createUsers);
router.post("/users/verify-email",  verifyUser, superAdminOnly, verifyEmailAdmin);
router.post("/users/resend-verification", verifyUser, superAdminOnly, resendVerificationCodeAdmin);
router.patch("/users/update/:uuid",  verifyUser, superAdminOnly, updateUsersById);
router.delete("/users/delete/:uuid", verifyUser, superAdminOnly, deleteUsers);
router.put("/users/verified/:uuid", verifyUser, superAdminOnly, verifyUserById);

export default router;