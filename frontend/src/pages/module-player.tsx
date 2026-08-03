import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { PlateProgress } from '@/components/Illustrations/PlateMark';
import { QuizPlayer } from '@/components/Modules/QuizPlayer';
import { apiFetch } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  completed?: boolean;
}

interface ModuleDetail {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

function toEmbedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export default function ModulePlayerPage() {
  const { moduleId } = useParams();
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<ModuleDetail>({
    queryKey: ['module', moduleId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}`),
    retry: false,
    enabled: Boolean(moduleId),
  });

  const lessons = data?.lessons ?? [];
  const activeLessonId = selectedLessonId ?? lessons[0]?.id ?? null;
  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;

  const { data: quiz, isError: noQuiz } = useQuery({
    queryKey: ['quiz-check', moduleId, activeLessonId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}/lessons/${activeLessonId}/quiz`),
    retry: false,
    enabled: Boolean(activeLessonId),
  });

  const markComplete = useMutation({
    mutationFn: () =>
      apiFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({ module_id: moduleId, lesson_id: activeLessonId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module', moduleId] }),
  });

  return (
    <div data-role="student" className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes modules
        </Link>

        {isLoading && <div className="mt-8 h-64 animate-pulse rounded-2xl bg-secondary" />}

        {!isLoading && (isError || !data) && (
          <div className="mt-8">
            <EmptyState
              icon={<PlayCircle className="h-7 w-7 text-primary" />}
              title="Ce module n’est pas encore disponible"
              description="Le contenu de ce module est en préparation. Reviens un peu plus tard."
            />
          </div>
        )}

        {!isLoading && data && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">{data.title}</h1>
              {data.description && <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>}

              {lessons.length === 0 && (
                <div className="mt-5">
                  <EmptyState
                    icon={<PlayCircle className="h-7 w-7 text-primary" />}
                    title="Pas encore de leçon"
                    description="Ce module n’a pas encore de contenu — reviens un peu plus tard."
                  />
                </div>
              )}

              {activeLesson && (
                <div className="mt-5">
                  <h2 className="font-display text-lg font-semibold text-foreground">{activeLesson.title}</h2>

                  {activeLesson.video_url && (
                    <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-foreground/90">
                      <iframe
                        src={toEmbedUrl(activeLesson.video_url)}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {activeLesson.content && (
                    <div className="prose-content mt-4 text-sm leading-relaxed text-foreground [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3">
                      <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                    </div>
                  )}

                  {quiz ? (
                    <QuizPlayer
                      moduleId={moduleId!}
                      lessonId={activeLesson.id}
                      onCompleted={() => queryClient.invalidateQueries({ queryKey: ['module', moduleId] })}
                    />
                  ) : noQuiz && !activeLesson.completed ? (
                    <button
                      onClick={() => markComplete.mutate()}
                      disabled={markComplete.isPending}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {markComplete.isPending ? 'Enregistrement…' : 'Marquer comme terminé'}
                    </button>
                  ) : (
                    noQuiz &&
                    activeLesson.completed && (
                      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        Leçon terminée
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <h2 className="mb-3 font-display text-sm font-semibold text-foreground">Leçons</h2>
              <ul className="space-y-1">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                        lesson.id === activeLessonId ? 'bg-secondary' : ''
                      }`}
                    >
                      <PlateProgress percent={lesson.completed ? 100 : 0} size={28} />
                      <span className="text-foreground">{lesson.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
