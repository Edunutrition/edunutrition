import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/progress/me
export async function getMyProgress(req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from('progress')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('completed_at', { ascending: false });
  if (error) throw new ApiError(500, error.message);
  res.json(data);
}

const markCompleteSchema = z.object({
  module_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
});

// POST /api/progress — marks a (video/text) lesson without a quiz as completed.
export async function markLessonComplete(req: Request, res: Response) {
  const body = markCompleteSchema.parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('progress')
    .upsert(
      {
        user_id: req.user!.id,
        module_id: body.module_id,
        lesson_id: body.lesson_id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    )
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}
