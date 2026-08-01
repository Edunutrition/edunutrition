import type { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

const isStaff = (role?: string) => role === 'admin' || role === 'teacher' || role === 'nurse';

async function assertCanViewStudent(req: Request, studentId: string) {
  const caller = req.user!;
  if (caller.id === studentId) return;
  if (!isStaff(caller.profile?.role)) throw new ApiError(403, 'Accès refusé');

  const { data: student, error } = await supabaseAdmin
    .from('profiles')
    .select('school_id')
    .eq('id', studentId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!student || student.school_id !== caller.profile?.school_id) {
    throw new ApiError(404, 'Élève introuvable');
  }
}

// GET /api/analytics/student/:id
export async function getStudentAnalytics(req: Request, res: Response) {
  await assertCanViewStudent(req, req.params.id);

  const { data: publishedLessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, modules!inner(published, duration_minutes)')
    .eq('modules.published', true);
  if (lessonsError) throw new ApiError(500, lessonsError.message);

  const totalLessons = publishedLessons?.length ?? 0;

  const { data: progress, error: progressError } = await supabaseAdmin
    .from('progress')
    .select('lesson_id, module_id, completed, quiz_score')
    .eq('user_id', req.params.id);
  if (progressError) throw new ApiError(500, progressError.message);

  const completedRows = (progress ?? []).filter((p) => p.completed);
  const scored = completedRows.filter((p) => p.quiz_score != null);
  const avgQuizScore =
    scored.length > 0 ? Math.round(scored.reduce((sum, p) => sum + (p.quiz_score ?? 0), 0) / scored.length) : null;

  // Proxy for time spent: sum the parent module's duration_minutes for every
  // fully-completed module (lessons don't carry their own duration).
  const completedModuleIds = new Set(completedRows.map((p) => p.module_id));
  const moduleDurations = new Map<string, number>();
  for (const lesson of publishedLessons ?? []) {
    const mod = (lesson as unknown as { modules: { duration_minutes: number | null } }).modules;
    if (mod?.duration_minutes) moduleDurations.set(lesson.module_id, mod.duration_minutes);
  }
  const timeSpentMinutes = [...completedModuleIds].reduce((sum, id) => sum + (moduleDurations.get(id) ?? 0), 0);

  res.json({
    student_id: req.params.id,
    completion_percent: totalLessons > 0 ? Math.round((completedRows.length / totalLessons) * 100) : 0,
    lessons_completed: completedRows.length,
    lessons_total: totalLessons,
    average_quiz_score: avgQuizScore,
    time_spent_minutes: timeSpentMinutes,
  });
}

async function computeSchoolAnalytics(schoolId: string) {
  const { data: students, error: studentsError } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('school_id', schoolId)
    .eq('role', 'student');
  if (studentsError) throw new ApiError(500, studentsError.message);

  const studentIds = (students ?? []).map((s) => s.id);

  const { data: publishedLessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id, modules!inner(published)')
    .eq('modules.published', true);
  if (lessonsError) throw new ApiError(500, lessonsError.message);
  const totalLessons = publishedLessons?.length ?? 0;

  let progress: { user_id: string; module_id: string; completed: boolean }[] = [];
  if (studentIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('progress')
      .select('user_id, module_id, completed')
      .in('user_id', studentIds);
    if (error) throw new ApiError(500, error.message);
    progress = data ?? [];
  }

  const completedByStudent = new Map<string, number>();
  const modulesUsed = new Set<string>();
  for (const row of progress) {
    modulesUsed.add(row.module_id);
    if (row.completed) {
      completedByStudent.set(row.user_id, (completedByStudent.get(row.user_id) ?? 0) + 1);
    }
  }

  const perStudent = (students ?? []).map((s) => {
    const completed = completedByStudent.get(s.id) ?? 0;
    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      lessons_completed: completed,
      completion_percent: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
    };
  });

  const overallCompletionPercent =
    totalLessons > 0 && perStudent.length > 0
      ? Math.round(perStudent.reduce((sum, s) => sum + s.completion_percent, 0) / perStudent.length)
      : 0;

  return {
    school_id: schoolId,
    students_enrolled: perStudent.length,
    modules_used: modulesUsed.size,
    overall_completion_percent: overallCompletionPercent,
    students: perStudent,
  };
}

function assertOwnSchoolOrAdmin(req: Request) {
  if (req.user!.profile?.school_id !== req.params.id) {
    throw new ApiError(403, 'Tu n’as pas accès à cette école');
  }
}

// GET /api/analytics/school/:id — anonymized (no per-student rows in the response).
export async function getSchoolAnalytics(req: Request, res: Response) {
  assertOwnSchoolOrAdmin(req);
  const result = await computeSchoolAnalytics(req.params.id);
  const { students: _students, ...anonymized } = result;
  res.json(anonymized);
}

// GET /api/analytics/school/:id/export — admin-only CSV, with per-student rows.
function toCsvValue(value: string | number | null) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function exportSchoolAnalyticsCsv(req: Request, res: Response) {
  assertOwnSchoolOrAdmin(req);
  const result = await computeSchoolAnalytics(req.params.id);

  const header = ['prenom', 'nom', 'lecons_terminees', 'pourcentage_completion'];
  const rows = result.students.map((s) =>
    [s.first_name, s.last_name, s.lessons_completed, s.completion_percent].map(toCsvValue).join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="analytics-ecole-${req.params.id}.csv"`);
  res.send(csv);
}
