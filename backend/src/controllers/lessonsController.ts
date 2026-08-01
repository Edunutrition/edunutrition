import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

const lessonSchema = z.object({
  title: z.string().min(1),
  content: z.string().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  order_num: z.number().int().nonnegative().optional(),
});

const isStaff = (role?: string) => role === 'admin' || role === 'teacher' || role === 'nurse';

async function getModuleOrThrow(moduleId: string) {
  const { data: module, error } = await supabaseAdmin
    .from('modules')
    .select('id, created_by, published')
    .eq('id', moduleId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!module) throw new ApiError(404, 'Module introuvable');
  return module;
}

async function assertModuleEditable(req: Request) {
  const module = await getModuleOrThrow(req.params.moduleId);
  const role = req.user!.profile?.role;
  if (module.created_by !== req.user!.id && role !== 'admin') {
    throw new ApiError(403, 'Seul·e l’auteur·rice ou un·e administrateur·rice peut modifier ce module');
  }
  return module;
}

/** Same visibility rule as getModule: published, or your own draft, or staff. */
async function assertModuleVisible(req: Request) {
  const module = await getModuleOrThrow(req.params.moduleId);
  const role = req.user!.profile?.role;
  if (!module.published && module.created_by !== req.user!.id && !isStaff(role)) {
    throw new ApiError(404, 'Module introuvable');
  }
  return module;
}

// GET /api/modules/:moduleId/lessons
export async function listLessons(req: Request, res: Response) {
  await assertModuleVisible(req);

  const { data, error } = await supabaseAdmin
    .from('lessons')
    .select('*')
    .eq('module_id', req.params.moduleId)
    .order('order_num', { ascending: true });
  if (error) throw new ApiError(500, error.message);
  res.json(data);
}

// POST /api/modules/:moduleId/lessons
export async function createLesson(req: Request, res: Response) {
  await assertModuleEditable(req);
  const body = lessonSchema.parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('lessons')
    .insert({ ...body, module_id: req.params.moduleId })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.status(201).json(data);
}

// PUT /api/modules/:moduleId/lessons/:lessonId
export async function updateLesson(req: Request, res: Response) {
  await assertModuleEditable(req);
  const body = lessonSchema.partial().parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('lessons')
    .update(body)
    .eq('id', req.params.lessonId)
    .eq('module_id', req.params.moduleId)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}

// DELETE /api/modules/:moduleId/lessons/:lessonId
export async function deleteLesson(req: Request, res: Response) {
  await assertModuleEditable(req);
  const { error } = await supabaseAdmin
    .from('lessons')
    .delete()
    .eq('id', req.params.lessonId)
    .eq('module_id', req.params.moduleId);
  if (error) throw new ApiError(400, error.message);
  res.status(204).send();
}
