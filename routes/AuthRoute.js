import express from "express";
import {
  Login,
  Me,
  registerUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  verificationTokenForResetPassword,
  resendCodeEmailForgotPassword,
  resetPassword,
  changeEmail,
  verificationTokenForChangeEmail,
  resendCodeForChangeEmail,
} from "../controllers/AuthController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/auth/me", verifyUser, Me);
router.post("/auth/login", Login);
router.post("/auth/register", registerUser);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerificationCode);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/verification-token-reset-password", verificationTokenForResetPassword);
router.post("/auth/resend-code-forgot-password",  resendCodeEmailForgotPassword);
router.post("/auth/reset-password", verifyUser, resetPassword);
router.post("/auth/change-email", verifyUser, changeEmail);
router.post("/auth/verify-change-email", verifyUser, verificationTokenForChangeEmail);
router.post("/auth/resend-code-change-email", verifyUser, resendCodeForChangeEmail);


export default router;
