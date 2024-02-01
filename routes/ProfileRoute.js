import express from 'express';
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createProfileAndUser,
  updateProfileUser,
  deleteProfileImage
} from '../controllers/ProfileController.js';
import { verifyUser } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/profiles', getAllProfileUsers);
router.get('/profiles/:uuid', getProfileUsersByUuid);
router.post('/profiles/users/create', createProfileAndUser);
router.patch('/profiles/update', verifyUser, updateProfileUser);
router.delete("/profile/image/delete", verifyUser, deleteProfileImage);

export default router;
