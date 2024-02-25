import express from 'express';
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createProfileForUser,
  updateProfile,
  deleteProfileImage,
} from '../controllers/ProfileController.js';
import { verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/profiles', getAllProfileUsers);
router.get('/profile/:uuid', getProfileUsersByUuid);
router.post('/profile/create', verifyUser, createProfileForUser);
router.patch('/profile/update', verifyUser, updateProfile);
router.delete("/profile/image/delete", verifyUser, deleteProfileImage);

export default router;
