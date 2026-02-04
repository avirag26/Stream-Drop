import Router from 'express'
import { adminAuthController } from '../../controllers/admin/adminAuth.controller.js'
import { AdminAuthMiddleware } from '../../middlewares/adminAuth.middleware.js'

const router  = Router()

// Admin authentication routes
router.post('/register', adminAuthController.register);
router.post('/login', adminAuthController.login);
router.post('/refresh-token', adminAuthController.refreshToken);
router.post('/logout', adminAuthController.logout);

// Protected admin routes
router.get('/users', AdminAuthMiddleware.verifyAdminToken, adminAuthController.getUsers);
router.patch('/users/:userId/block', AdminAuthMiddleware.verifyAdminToken, adminAuthController.toogleBlock);

export default router