import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { LEVEL_LABEL } from '@/components/Dashboard/ModuleCard';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface ModuleRow {
  id: string;
  title: string;
  level: string;
  category: string;
  published: boolean;
}

const ROLE_THEME = { admin: 'admin', teacher: 'school', nurse: 'school' } as const;

export default function ModulesManagePage() {
  const { profile } = useAuth();
  const theme = ROLE_THEME[profile?.role as keyof typeof ROLE_THEME] ?? 'school';

  const { data: modules, isLoading } = useQuery<ModuleRow[]>({
    queryKey: ['modules'],
    queryFn: () => apiFetch('/api/modules'),
  });

  return (
    <div data-role={theme} className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Modules</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tes brouillons et les modules publiés sur la plateforme.
            </p>
          </div>
          <Link
            to="/modules/manage/new"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card"
          >
            <Plus className="h-4 w-4" />
            Nouveau module
          </Link>
        </header>

        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        )}

        {!isLoading && modules?.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-7 w-7 text-primary" />}
            title="Aucun module pour l’instant"
            description="Crée ton premier module pour commencer à proposer du contenu à tes élèves."
            action={
              <Link
                to="/modules/manage/new"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Créer un module
              </Link>
            }
          />
        )}

        {!isLoading && modules && modules.length > 0 && (
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/modules/manage/${m.id}/edit`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 shadow-card hover:-translate-y-0.5 transition-transform"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {LEVEL_LABEL[m.level] ?? m.level} · {m.category}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      m.published ? 'bg-basil-100 text-basil-700' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {m.published ? 'Publié' : 'Brouillon'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
