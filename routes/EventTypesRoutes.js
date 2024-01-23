import express from 'express';
import {
  getAllEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../controllers/EventTypesController.js';

const router = express.Router();

router.get('/event-types', getAllEventTypes);
router.post('/event-types', createEventType);
router.patch('/event-types/update/:id', updateEventType);
router.delete('/event-types/delete/:id', deleteEventType);

export default router;
