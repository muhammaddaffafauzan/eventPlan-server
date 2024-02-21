import express from "express";
import {
  getAllEventsForAdmin,
  getAllEventsForNonAdmin,
  getEventForUser,
  getEventByIdForNonAdmin,
  getEventByIdForAdmin,
  createEvent,
  addLocationForEvent,
  addChecklistForEvent,
  updateChecklistForEvent,
  deleteChecklistForEvent,
  updateEvent,
  deleteEvent,
  updateEventValidation,
  eventFavorite,
  removeEventFromFavorites,
} from "../controllers/EventController.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/event/admin", verifyUser, adminOnly, getAllEventsForAdmin);
router.get("/events", getAllEventsForNonAdmin);
router.get("/event/user", verifyUser, getEventForUser);
router.get("/event/:uuid", getEventByIdForNonAdmin);
router.get("/event/admin/:uuid", verifyUser, adminOnly, getEventByIdForAdmin);
router.post("/event/create", verifyUser, createEvent);
router.patch("/event/update/:uuid", verifyUser, updateEvent);
router.post("/event/location/:uuid", verifyUser, addLocationForEvent);
router.delete("/event/delete/:uuid", verifyUser, deleteEvent);
router.post("/event/validation/:uuid", verifyUser, adminOnly, updateEventValidation);
router.post("/event/checklist/:uuid", verifyUser, addChecklistForEvent);
router.patch("/event/checklist/update/:uuid", verifyUser, updateChecklistForEvent);
router.patch("/event/checklist/delete/:uuid", verifyUser, deleteChecklistForEvent);
router.patch("/event/favorite", verifyUser, eventFavorite);
router.patch("/event/favorite/delete", verifyUser, removeEventFromFavorites);

export default router;
