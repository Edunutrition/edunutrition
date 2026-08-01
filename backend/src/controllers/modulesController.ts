import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

const isStaff = (role?: string) => role === 'admin' || role === 'teacher' || role === 'nurse';

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  level: z.enum(['co', 'gymnasium', 'university']),
  category: z.string().min(1),
  duration_minutes: z.number().int().positive().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
});

// GET /api/modules — published modules for everyone, plus the caller's own
// drafts if they're staff. Students get a computed progress_percent.
export async function listModules(req: Request, res: Response) {
  const userId = req.user!.id;
  const role = req.user!.profile?.role;

  let query = supabaseAdmin.from('modules').select('*').order('created_at', { ascending: false });
  query = isStaff(role) ? query.or(`published.eq.true,created_by.eq.${userId}`) : query.eq('published', true);

  const { data: modules, error } = await query;
  if (error) throw new ApiError(500, error.message);
  if (!modules || modules.length === 0) return res.json([]);

  const moduleIds = modules.map((m) => m.id);
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id')
    .in('module_id', moduleIds);
  if (lessonsError) throw new ApiError(500, lessonsError.message);

  const { data: progress, error: progressError } = await supabaseAdmin
    .from('progress')
    .select('lesson_id, module_id, completed')
    .eq('user_id', userId)
    .in('module_id', moduleIds);
  if (progressError) throw new ApiError(500, progressError.message);

  const lessonCountByModule = new Map<string, number>();
  for (const lesson of lessons ?? []) {
    lessonCountByModule.set(lesson.module_id, (lessonCountByModule.get(lesson.module_id) ?? 0) + 1);
  }
  const completedByModule = new Map<string, number>();
  for (const row of progress ?? []) {
    if (row.completed) {
      completedByModule.set(row.module_id, (completedByModule.get(row.module_id) ?? 0) + 1);
    }
  }

  const withProgress = modules.map((m) => {
    const total = lessonCountByModule.get(m.id) ?? 0;
    const completed = completedByModule.get(m.id) ?? 0;
    return { ...m, progress_percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  res.json(withProgress);
}

// GET /api/modules/:id — module detail with its lessons, each flagged
// completed/not for the current user.
export async function getModule(req: Request, res: Response) {
  const userId = req.user!.id;
  const role = req.user!.profile?.role;

  const { data: module, error } = await supabaseAdmin
    .from('modules')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!module) throw new ApiError(404, 'Module introuvable');
  if (!module.published && module.created_by !== userId && !isStaff(role)) {
    throw new ApiError(404, 'Module introuvable');
  }

  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id, title, order_num, video_url, content')
    .eq('module_id', module.id)
    .order('order_num', { ascending: true });
  if (lessonsError) throw new ApiError(500, lessonsError.message);

  const lessonIds = (lessons ?? []).map((l) => l.id);
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['00000000-0000-0000-0000-000000000000']);
  if (progressError) throw new ApiError(500, progressError.message);

  const completedLessonIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

  res.json({
    ...module,
    lessons: (lessons ?? []).map((l) => ({ ...l, completed: completedLessonIds.has(l.id) })),
  });
}

// POST /api/modules
export async function createModule(req: Request, res: Response) {
  const body = moduleSchema.parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('modules')
    .insert({ ...body, created_by: req.user!.id, published: false })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.status(201).json(data);
}

async function assertOwnedByCaller(req: Request) {
  const { data: module, error } = await supabaseAdmin
    .from('modules')
    .select('id, created_by')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!module) throw new ApiError(404, 'Module introuvable');

  const role = req.user!.profile?.role;
  if (module.created_by !== req.user!.id && role !== 'admin') {
    throw new ApiError(403, 'Seul·e l’auteur·rice ou un·e administrateur·rice peut modifier ce module');
  }
  return module;
}

// PUT /api/modules/:id
export async function updateModule(req: Request, res: Response) {
  await assertOwnedByCaller(req);
  const body = moduleSchema.partial().parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('modules')
    .update(body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}

// DELETE /api/modules/:id
export async function deleteModule(req: Request, res: Response) {
  await assertOwnedByCaller(req);
  const { error } = await supabaseAdmin.from('modules').delete().eq('id', req.params.id);
  if (error) throw new ApiError(400, error.message);
  res.status(204).send();
}

// POST /api/modules/:id/publish — toggles published, or sets it explicitly via { published }.
export async function togglePublish(req: Request, res: Response) {
  const module = await assertOwnedByCaller(req);
  const body = z.object({ published: z.boolean().optional() }).parse(req.body ?? {});
  const nextPublished = body.published ?? !(module as { published?: boolean }).published;

  const { data, error } = await supabaseAdmin
    .from('modules')
    .update({ published: nextPublished })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}
