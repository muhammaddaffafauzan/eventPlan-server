import express from "express";
import { followUser, unfollowUser, getEventsByFollowedUsers, getFollowersCountAndFollowingCount } from "../controllers/FollowersController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.post("/follow", verifyUser, followUser);
router.delete("/unfollow", verifyUser, unfollowUser);
router.get("/events/followed", verifyUser, getEventsByFollowedUsers);
router.get("/follow-stats/:uuid", getFollowersCountAndFollowingCount);

export default router;
