import { Router } from 'express';
import {
  createLesson,
  deleteLesson,
  listLessons,
  updateLesson,
} from '../controllers/lessonsController.js';
import {
  createModule,
  deleteModule,
  getModule,
  listModules,
  togglePublish,
  updateModule,
} from '../controllers/modulesController.js';
import { getQuiz, submitQuiz, upsertQuiz } from '../controllers/quizzesController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const staff = requireRole('admin', 'teacher', 'nurse');

router.get('/', requireAuth, asyncHandler(listModules));
router.get('/:id', requireAuth, asyncHandler(getModule));
router.post('/', requireAuth, staff, asyncHandler(createModule));
router.put('/:id', requireAuth, staff, asyncHandler(updateModule));
router.delete('/:id', requireAuth, staff, asyncHandler(deleteModule));
router.post('/:id/publish', requireAuth, staff, asyncHandler(togglePublish));

router.get('/:moduleId/lessons', requireAuth, asyncHandler(listLessons));
router.post('/:moduleId/lessons', requireAuth, staff, asyncHandler(createLesson));
router.put('/:moduleId/lessons/:lessonId', requireAuth, staff, asyncHandler(updateLesson));
router.delete('/:moduleId/lessons/:lessonId', requireAuth, staff, asyncHandler(deleteLesson));

router.get('/:moduleId/lessons/:lessonId/quiz', requireAuth, asyncHandler(getQuiz));
router.put('/:moduleId/lessons/:lessonId/quiz', requireAuth, staff, asyncHandler(upsertQuiz));
router.post('/:moduleId/lessons/:lessonId/quiz/submit', requireAuth, asyncHandler(submitQuiz));

export default router;
