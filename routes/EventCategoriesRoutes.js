import express from 'express';
import {
  getAllEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
} from '../controllers/EventCategoriesController.js';

const router = express.Router();

router.get('/event-categories', getAllEventCategories);
router.post('/event-categories', createEventCategory);
router.patch('/event-categories/update/:id', updateEventCategory);
router.delete('/event-categories/delete/:id', deleteEventCategory);

export default router;
