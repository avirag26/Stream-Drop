import { Router } from "express";
import {  profileController } from "@/controllers/auth/profile.controller";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { validate } from "../../middlewares/validate";
import { changePasswordSchema,chnageNameSchema } from "@/validation/user.validation";
import { uploadProfilePhoto } from "@/middlewares/upload.middleware";

const router = Router();

router.get('/',AuthMiddleware.verifyToken,profileController.getProfile);
router.put('/', validate(chnageNameSchema),AuthMiddleware.verifyToken, profileController.updateProfile);
router.post('/change-password',validate(changePasswordSchema), AuthMiddleware.verifyToken, profileController.chnagePassword);
router.post('/upload-photo',AuthMiddleware.verifyToken,uploadProfilePhoto,profileController.uploadPhoto)
export default router