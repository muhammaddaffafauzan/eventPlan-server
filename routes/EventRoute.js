import express from "express";
import {
  getAllEventsForAdmin,
  getAllEventsForNonAdmin,
  getEventForUser,
  getEventByUuidForUser,
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
  getFavoriteEvents,
  eventFavorite,
  removeEventFromFavorites,
  sendEventReminders,
  sendEventRemindersToNonAdminUsersWithEvents,
  getEventRemindersForUser,
} from "../controllers/EventController.js";
import { adminOnly, superAdminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();
router.get("/event/admin", verifyUser, adminOnly, getAllEventsForAdmin);
router.get("/events", getAllEventsForNonAdmin);
router.get("/event/user", verifyUser, getEventForUser);
router.get("/event/user/:uuid", verifyUser, getEventByUuidForUser);
router.get("/event/:uuid", getEventByIdForNonAdmin);
router.get("/event/admin/:uuid", verifyUser, adminOnly, getEventByIdForAdmin);
router.post("/event/create", verifyUser, createEvent);
router.put("/event/update/:uuid", verifyUser, updateEvent);
router.post("/event/location/:uuid", verifyUser, addLocationForEvent);
router.delete("/event/delete/:uuid", verifyUser, deleteEvent);
router.post("/event/validation/:uuid", verifyUser, adminOnly, updateEventValidation);
router.post("/event/checklist/add/:uuid", verifyUser, addChecklistForEvent);
router.put("/event/checklist/update/:uuid/:id_check", verifyUser, updateChecklistForEvent);
router.delete("/event/checklist/delete/:id_check", verifyUser, deleteChecklistForEvent);
router.get("/event/favorite/all", verifyUser, getFavoriteEvents);
router.post("/event/favorite/add", verifyUser, eventFavorite);
router.delete("/event/favorite/delete", verifyUser, removeEventFromFavorites);
router.post("/event/reminders", verifyUser, sendEventReminders);
router.post("/event/reminders/send", verifyUser, adminOnly, sendEventRemindersToNonAdminUsersWithEvents);
router.get("/event/reminders/get", verifyUser, getEventRemindersForUser);

export default router;
