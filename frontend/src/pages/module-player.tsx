import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { PlateProgress } from '@/components/Illustrations/PlateMark';
import { apiFetch } from '@/lib/api';

interface ModuleDetail {
  id: string;
  title: string;
  description: string | null;
  lessons: { id: string; title: string; completed?: boolean }[];
}

export default function ModulePlayerPage() {
  const { moduleId } = useParams();

  const { data, isLoading, isError } = useQuery<ModuleDetail>({
    queryKey: ['module', moduleId],
    queryFn: () => apiFetch(`/api/modules/${moduleId}`),
    retry: false,
    enabled: Boolean(moduleId),
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

        {isLoading && (
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-secondary" />
        )}

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
              {data.description && (
                <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>
              )}
              <div className="mt-5 flex aspect-video items-center justify-center rounded-2xl bg-foreground/90 text-background/70">
                <PlayCircle className="h-12 w-12" />
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <h2 className="mb-3 font-display text-sm font-semibold text-foreground">Leçons</h2>
              <ul className="space-y-2">
                {data.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-secondary"
                  >
                    <PlateProgress percent={lesson.completed ? 100 : 0} size={28} />
                    <span className="text-foreground">{lesson.title}</span>
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
