import { Router } from "express";
import { boxController } from "@/controllers/box/box.controller";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
const router = Router();

router.post('/create',AuthMiddleware.verifyToken,boxController.create)
router.get('/latest', AuthMiddleware.verifyToken, boxController.getLatestBox);
router.get('/:code', boxController.getBox)

export default router