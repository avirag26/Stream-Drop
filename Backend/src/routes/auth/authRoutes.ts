import { Router } from "express";
import { authController } from "../../controllers/auth/auth.controller";
import { validate } from "../../middlewares/validate";
import { registerSchema, resetPasswordSchema } from "../../validation/user.validation";
import { AuthMiddleware } from "../../middlewares/auth.middleware";

const router = Router()

// Authentication routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/resend-otp', authController.resendOtp);

// Social login
router.post('/google-login', authController.googleLogin);

// Protected routes
router.get('/status', AuthMiddleware.verifyToken, authController.checkStatus);


export default router;