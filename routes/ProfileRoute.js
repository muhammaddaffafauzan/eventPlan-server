import express from 'express';
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createProfileAndUser,
  updateProfileUser,
} from '../controllers/ProfileController.js';
import { verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/profiles', getAllProfileUsers);
router.get('/profiles/:uuid', getProfileUsersByUuid);
router.post('/profiles/users/create', verifyUser, createProfileAndUser);
router.patch('/profiles/update/:uuid', verifyUser, updateProfileUser);

export default router;
