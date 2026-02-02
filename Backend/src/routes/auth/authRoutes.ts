import { Router } from "express";
import { authController } from "@/controllers/auth/auth.controller";
import { validate } from "@/middlewares/validate";
import { registerSchema, resetPasswordSchema } from "@/validation/user.validation";
import { AuthMiddleware } from "@/middlewares/auth.middleware";

const router = Router()

router.post('/register', validate(registerSchema), authController.register);

router.post('/verify-otp', authController.verifyOtp);

router.post('/login',authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/verify-reset-otp', authController.verifyResetOtp);

router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.post('/resend-otp', authController.resendOtp);

router.post('/google-login', authController.googleLogin);

router.get('/status', AuthMiddleware.verifyToken, authController.checkStatus);

export default router;