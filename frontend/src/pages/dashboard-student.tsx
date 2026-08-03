import { useQuery } from '@tanstack/react-query';
import { BarChart3, BookOpen, CheckCircle2, Home, Sprout, Target } from 'lucide-react';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { ModuleCard, type ModuleSummary } from '@/components/Dashboard/ModuleCard';
import { RoleLayout } from '@/components/Dashboard/RoleLayout';
import { StatTile } from '@/components/Dashboard/StatTile';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

function useModules() {
  return useQuery<ModuleSummary[]>({
    queryKey: ['modules'],
    queryFn: () => apiFetch('/api/modules'),
    retry: false,
  });
}

interface ProgressRow {
  completed: boolean;
  quiz_score: number | null;
}

function useProgress() {
  return useQuery<ProgressRow[]>({
    queryKey: ['progress-me'],
    queryFn: () => apiFetch('/api/progress/me'),
    retry: false,
  });
}

export default function DashboardStudentPage() {
  const { profile } = useAuth();
  const { data: modules, isLoading, isError } = useModules();
  const { data: progress } = useProgress();

  const hasModules = !isLoading && !isError && modules && modules.length > 0;

  const completedCount = progress?.filter((p) => p.completed).length ?? 0;
  const scores = progress?.filter((p) => p.quiz_score != null).map((p) => p.quiz_score as number) ?? [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;

  return (
    <RoleLayout
      theme="student"
      title={`Bonjour ${profile?.first_name ?? ''} 👋`}
      subtitle="Voici où tu en es dans tes modules."
      navItems={[
        { label: 'Aperçu', href: '#apercu', icon: <Home className="h-4 w-4" /> },
        { label: 'Mes modules', href: '#modules', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Progression', href: '#progression', icon: <BarChart3 className="h-4 w-4" /> },
      ]}
    >
      <section id="modules" className="space-y-5">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        )}

        {!isLoading && !hasModules && (
          <EmptyState
            icon={<Sprout className="h-7 w-7 text-primary" />}
            title="Aucun module disponible pour l’instant"
            description="Ton école n’a pas encore publié de module. Reviens un peu plus tard, ou demande à ton enseignant·e ou infirmier·ère scolaire où ça en est."
          />
        )}

        {hasModules && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules!.map((module, i) => (
              <ModuleCard key={module.id} module={module} index={i} />
            ))}
          </div>
        )}
      </section>

      <section id="progression" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Ta progression</h2>
        {completedCount === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Termine quelques leçons et tu verras ta progression s’afficher ici.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Leçons terminées"
              value={String(completedCount)}
            />
            <StatTile
              icon={<Target className="h-4 w-4" />}
              label="Score moyen aux quiz"
              value={avgScore !== null ? `${avgScore}%` : '—'}
              hint={avgScore === null ? 'Aucun quiz fait pour l’instant' : undefined}
            />
          </div>
        )}
      </section>
    </RoleLayout>
  );
}
