import express from 'express';
import {
  getAllProfileUsers,
  getProfileUsersByUuid,
  createProfileAndUser,
  updateProfileUser,
  deleteProfileImage,
  createProfileForAdmin,
  updateProfileForAdmin
} from '../controllers/ProfileController.js';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';

const router = express.Router();

router.get('/profiles', getAllProfileUsers);
router.get('/profile/:uuid', getProfileUsersByUuid);
router.post('/profile/users/create', createProfileAndUser);
router.patch('/profile/update', verifyUser, updateProfileUser);
router.delete("/profile/image/delete", verifyUser, deleteProfileImage);
router.post("/profile/admin/create", verifyUser, adminOnly, createProfileForAdmin);
router.patch("/profile/admin/update", verifyUser, adminOnly, updateProfileForAdmin);

export default router;
