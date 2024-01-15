import express from "express";
import {
  getUsers,
  getUsersById,
  createAdminUsers,
  updateUsers,
  deleteUsers,
} from "../controllers/UsersController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/users", verifyUser, getUsers);
router.get("/users/:uuid",  verifyUser, getUsersById);
router.post("/users/addAdmin", adminOnly, verifyUser, createAdminUsers);
router.put("/users/update/:uuid",  verifyUser, updateUsers);
router.delete("/users/delete/:uuid",  verifyUser, deleteUsers);

export default router;