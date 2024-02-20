import express from 'express';
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createProfileForUser,
  updateProfileUser,
  deleteProfileImage,
  createProfileForAdmin,
} from '../controllers/ProfileController.js';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/profiles', getAllProfileUsers);
router.get('/profile/:uuid', getProfileUsersByUuid);
router.post('/profile/users/create', verifyUser, createProfileForUser);
router.patch('/profile/update', verifyUser, updateProfileUser);
router.delete("/profile/image/delete", verifyUser, deleteProfileImage);
router.post("/profile/admin/create", verifyUser, adminOnly, createProfileForAdmin);

export default router;
