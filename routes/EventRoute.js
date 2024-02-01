import express from "express";
import {
  getAllEvent,
  getEventForUser,
  getEventById,
  createEvent,
  addLocationForEvent,
  addImageForEvent,
  deleteImageForEvent,
  addChecklistForEvent,
  updateChecklistForEvent,
  deleteChecklistForEvent,
  updateEvent,
  deleteEvent,
  updateEventValidation,
  eventFavorite,
  removeEventFromFavorites,
  addTagsForEvent,
  deleteTagsForEvent
} from "../controllers/EventController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/event", getAllEvent);
router.get("/event/user", verifyUser, getEventForUser);
router.get("/event/:uuid", getEventById);
router.post("/event/create", verifyUser, createEvent);
router.post("/event/location/:uuid", verifyUser, addLocationForEvent);
router.post("/event/image/add/:uuid", verifyUser, addImageForEvent);
router.post("/event/image/delete/:uuid", verifyUser, deleteImageForEvent);
router.patch("/event/update/:uuid", verifyUser, updateEvent);
router.delete("/event/delete/:uuid", verifyUser, deleteEvent);
router.post("/event/validation/:uuid", verifyUser, adminOnly, updateEventValidation);
router.post("/event/checklist/:uuid", verifyUser, addChecklistForEvent);
router.patch("/event/checklist/update/:uuid", verifyUser, updateChecklistForEvent);
router.patch("/event/checklist/delete/:uuid", verifyUser, deleteChecklistForEvent);
router.patch("/event/favorite", verifyUser, eventFavorite);
router.patch("/event/favorite/delete", verifyUser, removeEventFromFavorites);
router.post("/event/tags/:uuid", verifyUser, addTagsForEvent);
router.delete("/event/tags/delete/:uuid", verifyUser, deleteTagsForEvent);

export default router;
