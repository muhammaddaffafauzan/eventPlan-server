import express from "express";
import {
  getUsers,
  getAdmin,
  getUsersById,
  getAdminById,
  createAdminUsers,
  updateUsersById,
  updateUser,
  updateAdmin,
  deleteUsers,
} from "../controllers/UsersController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/users", verifyUser, getUsers);
router.get("/admin", verifyUser, adminOnly, getAdmin);
router.get("/users/:uuid",  verifyUser, getUsersById);
router.get("/admin/:uuid", verifyUser, adminOnly, getAdminById);
router.post("/addAdmin", verifyUser, adminOnly, createAdminUsers);
router.patch("/users/update/:uuid",  verifyUser, updateUsersById);
router.patch("/user/update",  verifyUser, updateUser);
router.patch("/admin/update",  verifyUser, adminOnly, updateAdmin);
router.delete("/users/delete/:uuid",  verifyUser, deleteUsers);

export default router;