import express from "express";
import {
  getAllEvent,
  getEventForUser,

} from "../controllers/EventController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/event", getAllEvent);
router.get("/event/user", verifyUser, getEventForUser);
router.get("/event/:uuid", getEventForUser);

export default router;