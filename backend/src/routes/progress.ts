import { Router } from 'express';
import { getMyProgress, markLessonComplete } from '../controllers/progressController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getMyProgress));
router.post('/', requireAuth, asyncHandler(markLessonComplete));

export default router;
