import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correct: z.number().int().nonnegative(),
});

const quizSchema = z.object({ questions: z.array(questionSchema).min(1) });

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

async function getLessonOrThrow(lessonId: string, moduleId: string) {
  const { data: lesson, error } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id')
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!lesson) throw new ApiError(404, 'Leçon introuvable');
  return lesson;
}

// GET /api/modules/:moduleId/lessons/:lessonId/quiz — the module's owner (or
// an admin) gets `correct` back so they can edit it; anyone else (students)
// gets the questions stripped of the answer, so it can't be read off the
// network tab.
export async function getQuiz(req: Request, res: Response) {
  const module = await assertModuleVisible(req);
  await getLessonOrThrow(req.params.lessonId, req.params.moduleId);

  const { data: quiz, error } = await supabaseAdmin
    .from('quizzes')
    .select('id, questions')
    .eq('lesson_id', req.params.lessonId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!quiz) throw new ApiError(404, 'Aucun quiz pour cette leçon');

  const canEdit = module.created_by === req.user!.id || req.user!.profile?.role === 'admin';
  const questions = canEdit
    ? quiz.questions
    : (quiz.questions as QuizQuestion[]).map(({ question, options }) => ({ question, options }));
  res.json({ id: quiz.id, questions });
}

// PUT /api/modules/:moduleId/lessons/:lessonId/quiz — create or replace.
export async function upsertQuiz(req: Request, res: Response) {
  await assertModuleEditable(req);
  await getLessonOrThrow(req.params.lessonId, req.params.moduleId);
  const body = quizSchema.parse(req.body);

  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .upsert({ lesson_id: req.params.lessonId, questions: body.questions }, { onConflict: 'lesson_id' })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  res.json(data);
}

// POST /api/modules/:moduleId/lessons/:lessonId/quiz/submit
export async function submitQuiz(req: Request, res: Response) {
  await assertModuleVisible(req);
  const lesson = await getLessonOrThrow(req.params.lessonId, req.params.moduleId);
  const body = z.object({ answers: z.array(z.number().int().nonnegative()) }).parse(req.body);

  const { data: quiz, error } = await supabaseAdmin
    .from('quizzes')
    .select('questions')
    .eq('lesson_id', req.params.lessonId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!quiz) throw new ApiError(404, 'Aucun quiz pour cette leçon');

  const questions = quiz.questions as QuizQuestion[];
  if (body.answers.length !== questions.length) {
    throw new ApiError(400, `${questions.length} réponses attendues, ${body.answers.length} reçues`);
  }

  const correctCount = questions.filter((q, i) => q.correct === body.answers[i]).length;
  const score = Math.round((correctCount / questions.length) * 100);

  const { error: progressError } = await supabaseAdmin.from('progress').upsert(
    {
      user_id: req.user!.id,
      module_id: lesson.module_id,
      lesson_id: lesson.id,
      completed: true,
      quiz_score: score,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );
  if (progressError) throw new ApiError(500, progressError.message);

  res.json({ score, correct: correctCount, total: questions.length });
}
