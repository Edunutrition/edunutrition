import { Router } from 'express';
import { getSchool, listStudents, updateSchool } from '../controllers/schoolsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/:id', requireAuth, asyncHandler(getSchool));
router.put('/:id', requireAuth, requireRole('admin'), asyncHandler(updateSchool));
router.get('/:id/students', requireAuth, requireRole('admin', 'teacher', 'nurse'), asyncHandler(listStudents));

export default router;
