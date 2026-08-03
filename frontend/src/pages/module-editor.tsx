import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { LEVEL_LABEL } from '@/components/Dashboard/ModuleCard';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

const moduleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  level: z.enum(['co', 'gymnasium', 'university']),
  category: z.string().min(1, 'La catégorie est requise'),
  duration_minutes: z.coerce.number().int().positive().optional().or(z.literal('')),
});

type ModuleValues = z.infer<typeof moduleSchema>;

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  level: string;
  category: string;
  duration_minutes: number | null;
  published: boolean;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_num: number;
}

const ROLE_THEME = { admin: 'admin', teacher: 'school', nurse: 'school' } as const;

export default function ModuleEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const theme = ROLE_THEME[profile?.role as keyof typeof ROLE_THEME] ?? 'school';

  const { data: module } = useQuery<ModuleData>({
    queryKey: ['module-edit', id],
    queryFn: () => apiFetch(`/api/modules/${id}`),
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModuleValues>({ resolver: zodResolver(moduleSchema) });

  useEffect(() => {
    if (module) {
      reset({
        title: module.title,
        description: module.description ?? '',
        level: module.level as ModuleValues['level'],
        category: module.category,
        duration_minutes: module.duration_minutes ?? '',
      });
    }
  }, [module, reset]);

  async function onSubmit(values: ModuleValues) {
    const payload = {
      ...values,
      duration_minutes: values.duration_minutes === '' ? null : Number(values.duration_minutes),
    };
    if (isNew) {
      const created = await apiFetch('/api/modules', { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/modules/manage/${created.id}/edit`, { replace: true });
    } else {
      await apiFetch(`/api/modules/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      queryClient.invalidateQueries({ queryKey: ['module-edit', id] });
    }
  }

  const publishMutation = useMutation({
    mutationFn: (published: boolean) =>
      apiFetch(`/api/modules/${id}/publish`, { method: 'POST', body: JSON.stringify({ published }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module-edit', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/modules/${id}`, { method: 'DELETE' }),
    onSuccess: () => navigate('/modules/manage'),
  });

  return (
    <div data-role={theme} className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link
          to="/modules/manage"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Tous les modules
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          {isNew ? 'Nouveau module' : 'Modifier le module'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div>
            <label className="block text-sm font-medium text-foreground">Titre</label>
            <input
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary"
              {...register('title')}
            />
            {errors.title && <p className="mt-1.5 text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Niveau</label>
              <select
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary"
                {...register('level')}
              >
                {Object.entries(LEVEL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Durée (min)</label>
              <input
                type="number"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary"
                {...register('duration_minutes')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Catégorie</label>
            <input
              list="category-suggestions"
              placeholder="basics, sports, diabetes, marketing…"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary"
              {...register('category')}
            />
            <datalist id="category-suggestions">
              <option value="basics" />
              <option value="sports" />
              <option value="diabetes" />
              <option value="marketing" />
            </datalist>
            {errors.category && <p className="mt-1.5 text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>

            {!isNew && module && (
              <>
                <button
                  type="button"
                  onClick={() => publishMutation.mutate(!module.published)}
                  className="rounded-xl border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {module.published ? 'Dépublier' : 'Publier'}
                </button>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    module.published ? 'bg-basil-100 text-basil-700' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {module.published ? 'Publié' : 'Brouillon'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Supprimer ce module et toutes ses leçons ?')) deleteMutation.mutate();
                  }}
                  className="ml-auto flex items-center gap-1.5 text-sm text-destructive hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </>
            )}
          </div>
        </form>

        {!isNew && id && <LessonsSection moduleId={id} />}
      </div>
    </div>
  );
}

const lessonSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().optional(),
  video_url: z.string().url('URL invalide').optional().or(z.literal('')),
  order_num: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
});

type LessonValues = z.infer<typeof lessonSchema>;

function LessonsSection({ moduleId }: { moduleId: string }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [quizEditingId, setQuizEditingId] = useState<string | null>(null);

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ['lessons', moduleId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}/lessons`),
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => apiFetch(`/api/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] }),
  });

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Leçons</h2>
        {editingId === null && (
          <button
            onClick={() => setEditingId('new')}
            className="flex items-center gap-1.5 rounded-xl border border-input px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            Ajouter une leçon
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {lessons?.map((lesson) =>
          editingId === lesson.id ? (
            <LessonForm
              key={lesson.id}
              moduleId={moduleId}
              lesson={lesson}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <li key={lesson.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{lesson.title}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuizEditingId(quizEditingId === lesson.id ? null : lesson.id)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Quiz
                  </button>
                  <button
                    onClick={() => setEditingId(lesson.id)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette leçon ?')) deleteLesson.mutate(lesson.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {quizEditingId === lesson.id && (
                <QuizEditor moduleId={moduleId} lessonId={lesson.id} onDone={() => setQuizEditingId(null)} />
              )}
            </li>
          ),
        )}
      </ul>

      {editingId === 'new' && (
        <div className="mt-3">
          <LessonForm moduleId={moduleId} onDone={() => setEditingId(null)} />
        </div>
      )}

      {lessons?.length === 0 && editingId === null && (
        <p className="mt-4 text-sm text-muted-foreground">Ce module n’a pas encore de leçon.</p>
      )}
    </section>
  );
}

function LessonForm({
  moduleId,
  lesson,
  onDone,
}: {
  moduleId: string;
  lesson?: Lesson;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: lesson
      ? {
          title: lesson.title,
          content: lesson.content ?? '',
          video_url: lesson.video_url ?? '',
          order_num: lesson.order_num,
        }
      : undefined,
  });

  async function onSubmit(values: LessonValues) {
    const payload = {
      ...values,
      video_url: values.video_url || null,
      order_num: values.order_num === '' ? undefined : Number(values.order_num),
    };
    if (lesson) {
      await apiFetch(`/api/modules/${moduleId}/lessons/${lesson.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch(`/api/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(payload) });
    }
    queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl border border-border bg-card p-4"
    >
      <div>
        <label className="block text-xs font-medium text-foreground">Titre</label>
        <input
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
          {...register('title')}
        />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground">Contenu (markdown)</label>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
          {...register('content')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground">URL vidéo</label>
          <input
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
            {...register('video_url')}
          />
          {errors.video_url && <p className="mt-1 text-xs text-destructive">{errors.video_url.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground">Ordre</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
            {...register('order_num')}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-input px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

interface QuizQuestionDraft {
  question: string;
  options: string[];
  correct: number;
}

const BLANK_QUESTION: QuizQuestionDraft = { question: '', options: ['', ''], correct: 0 };

function QuizEditor({
  moduleId,
  lessonId,
  onDone,
}: {
  moduleId: string;
  lessonId: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<QuizQuestionDraft[] | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: existingQuiz,
    isLoading,
    isError,
  } = useQuery<{ questions: QuizQuestionDraft[] }>({
    queryKey: ['quiz-edit', moduleId, lessonId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`),
    retry: false,
  });

  // Seed local draft state exactly once when the fetch settles — this effect
  // must not re-run on every `questions` edit, or it would clobber the
  // teacher's in-progress changes with the original server data.
  useEffect(() => {
    if (initialized) return;
    if (existingQuiz) {
      setQuestions(existingQuiz.questions);
      setInitialized(true);
    } else if (isError) {
      setQuestions([{ ...BLANK_QUESTION, options: [...BLANK_QUESTION.options] }]);
      setInitialized(true);
    }
  }, [existingQuiz, isError, initialized]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`/api/modules/${moduleId}/lessons/${lessonId}/quiz`, {
        method: 'PUT',
        body: JSON.stringify({ questions }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-edit', moduleId, lessonId] });
      onDone();
    },
    onError: (err: Error) => setSaveError(err.message),
  });

  if (isLoading || questions === null) {
    return <div className="mt-3 h-24 animate-pulse rounded-xl bg-secondary" />;
  }

  function updateQuestion(qIndex: number, patch: Partial<QuizQuestionDraft>) {
    setQuestions((prev) => prev!.map((q, i) => (i === qIndex ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev!.map((q, i) => (i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q)),
    );
  }

  function addOption(qIndex: number) {
    setQuestions((prev) => prev!.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ''] } : q)));
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev!.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oIndex),
              correct: q.correct >= oIndex && q.correct > 0 ? q.correct - 1 : q.correct,
            }
          : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev!, { ...BLANK_QUESTION, options: [...BLANK_QUESTION.options] }]);
  }

  function removeQuestion(qIndex: number) {
    setQuestions((prev) => prev!.filter((_, i) => i !== qIndex));
  }

  const isValid =
    questions.length > 0 &&
    questions.every((q) => q.question.trim() && q.options.length >= 2 && q.options.every((o) => o.trim()));

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-border bg-background p-4">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-start gap-2">
            <input
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
              placeholder="Intitulé de la question"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
            />
            <button
              onClick={() => removeQuestion(qIndex)}
              className="mt-2 text-muted-foreground hover:text-destructive"
              aria-label="Supprimer la question"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 space-y-1.5">
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correct === oIndex}
                  onChange={() => updateQuestion(qIndex, { correct: oIndex })}
                  className="h-3.5 w-3.5"
                  aria-label="Bonne réponse"
                />
                <input
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-primary"
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer l’option"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addOption(qIndex)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              + Ajouter une option
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
      >
        <Plus className="h-4 w-4" />
        Ajouter une question
      </button>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}

      <div className="flex gap-2 border-t border-border pt-3">
        <button
          onClick={() => save.mutate()}
          disabled={!isValid || save.isPending}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? 'Enregistrement…' : 'Enregistrer le quiz'}
        </button>
        <button
          onClick={onDone}
          className="rounded-lg border border-input px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
