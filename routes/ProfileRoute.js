import express from "express";
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createOrUpdateProfile,
  deleteProfileImage,
} from "../controllers/ProfileController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/profiles", getAllProfileUsers);
router.get("/profile/:uuid", getProfileUsersByUuid);
router.post("/profile/createOrUpdate", verifyUser, createOrUpdateProfile);
router.delete("/profile/image/delete", verifyUser, deleteProfileImage);

export default router;
