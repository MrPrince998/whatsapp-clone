import { Router } from "express";
import authController from "../controller/authController";
import { authenticateToken } from "../middleware/auth";
import {
  authRateLimit,
  otpRateLimit,
  validateGenerateOTP,
  validateVerifyOTP,
  validateResendOTP,
  handleValidationErrors,
} from "../middleware/security";

const authRoutes = Router();

// Public routes (no authentication required) with validation and rate limiting
authRoutes.post(
  "/generate-otp",
  otpRateLimit,
  validateGenerateOTP,
  handleValidationErrors,
  authController.generateOTP
);

authRoutes.post(
  "/verify-otp",
  authRateLimit,
  validateVerifyOTP,
  handleValidationErrors,
  authController.verifyOTP
);

authRoutes.post(
  "/resend-otp",
  otpRateLimit,
  validateResendOTP,
  handleValidationErrors,
  authController.resendOTP
);

// Protected routes (authentication required)
authRoutes.post("/logout", authenticateToken, authController.logout);
authRoutes.get("/profile", authenticateToken, authController.getProfile);

export default authRoutes;
