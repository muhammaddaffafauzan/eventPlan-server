import express from 'express';
import {
  getAllEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
} from '../controllers/EventCategoriesController.js';
import { adminOnly, verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/event-categories', getAllEventCategories);
router.post('/event-categories/create', verifyUser, adminOnly, createEventCategory);
router.put('/event-categories/update/:id',  verifyUser, adminOnly, updateEventCategory);
router.delete('/event-categories/delete/:id',  verifyUser, adminOnly, deleteEventCategory);
  
export default router;
