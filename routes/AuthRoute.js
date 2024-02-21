import express from "express";
import {Login, Me, registerUser} from "../controllers/AuthController.js";
import { verifyUser } from "../middleware/AuthUser.js";
const router = express.Router();

router.get('/auth/me', verifyUser, Me);
router.post('/auth/login', Login);
router.post('/auth/register', registerUser);

export default router;