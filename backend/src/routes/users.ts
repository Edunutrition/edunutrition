import { Router } from 'express';
import { inviteUser, listUsers, updateUser } from '../controllers/usersController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), asyncHandler(listUsers));
router.post('/invite', requireAuth, requireRole('admin'), asyncHandler(inviteUser));
router.put('/:id', requireAuth, asyncHandler(updateUser));

export default router;
