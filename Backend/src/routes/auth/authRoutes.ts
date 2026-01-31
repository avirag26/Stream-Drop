import { Router } from "express";
import { authController } from "@/controllers/auth/auth.controller";

const router = Router()

router.post('/register',authController.register);

router.post('/verify-otp', authController.verifyOtp);

router.post('/login',authController.login);

router.post('/forgot-password', authController.forgotPassword);


router.post('/verify-reset-otp', authController.verifyResetOtp);


router.post('/reset-password', authController.resetPassword);

export default router;