import { Router } from 'express';
import { login, logout, me, signup } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.post('/logout', requireAuth, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
