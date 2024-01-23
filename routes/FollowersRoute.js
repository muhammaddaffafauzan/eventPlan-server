import express from "express";
import { followUser, unfollowUser, getEventsByFollowedUsers } from "../controllers/FollowersController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/follow", verifyUser, followUser);
router.delete("/unfollow", verifyUser, unfollowUser);
router.get("/events/followed", verifyUser, getEventsByFollowedUsers);

export default router;
