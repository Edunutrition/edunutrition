import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

function assertOwnSchool(req: Request) {
  if (req.user!.profile?.school_id !== req.params.id) {
    throw new ApiError(403, 'Tu n’as pas accès à cette école');
  }
}

// GET /api/schools/:id
export async function getSchool(req: Request, res: Response) {
  assertOwnSchool(req);

  const { data, error } = await supabaseAdmin.from('schools').select('*').eq('id', req.params.id).maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, 'École introuvable');

  res.json(data);
}

const updateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  canton: z.string().min(1).nullable().optional(),
  email: z.string().email().nullable().optional(),
});

// PUT /api/schools/:id
export async function updateSchool(req: Request, res: Response) {
  assertOwnSchool(req);
  const body = updateSchoolSchema.parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('schools')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}

// GET /api/schools/:id/students
export async function listStudents(req: Request, res: Response) {
  assertOwnSchool(req);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name, last_name, created_at')
    .eq('school_id', req.params.id)
    .eq('role', 'student')
    .order('last_name', { ascending: true });
  if (error) throw new ApiError(500, error.message);

  res.json(data);
}
