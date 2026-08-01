import { Router } from 'express';
import {
  exportSchoolAnalyticsCsv,
  getSchoolAnalytics,
  getStudentAnalytics,
} from '../controllers/analyticsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/student/:id', requireAuth, asyncHandler(getStudentAnalytics));
router.get('/school/:id', requireAuth, requireRole('admin', 'teacher', 'nurse'), asyncHandler(getSchoolAnalytics));
router.get('/school/:id/export', requireAuth, requireRole('admin'), asyncHandler(exportSchoolAnalyticsCsv));

export default router;
