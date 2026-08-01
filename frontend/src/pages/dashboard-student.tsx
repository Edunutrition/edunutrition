import { useQuery } from '@tanstack/react-query';
import { BarChart3, BookOpen, Home, Sprout } from 'lucide-react';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { ModuleCard, type ModuleSummary } from '@/components/Dashboard/ModuleCard';
import { RoleLayout } from '@/components/Dashboard/RoleLayout';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

function useModules() {
  return useQuery<ModuleSummary[]>({
    queryKey: ['modules'],
    queryFn: () => apiFetch('/api/modules'),
    retry: false,
  });
}

export default function DashboardStudentPage() {
  const { profile } = useAuth();
  const { data: modules, isLoading, isError } = useModules();

  const hasModules = !isLoading && !isError && modules && modules.length > 0;

  return (
    <RoleLayout
      theme="student"
      title={`Bonjour ${profile?.first_name ?? ''} 👋`}
      subtitle="Voici tes modules d’éducation nutritionnelle."
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
            description="Ton école n’a pas encore publié de module — reviens bientôt, ou demande à ton enseignant·e ou infirmier·ère scolaire."
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
        <p className="mt-1 text-sm text-muted-foreground">
          Complète des leçons pour voir ta progression apparaître ici.
        </p>
      </section>
    </RoleLayout>
  );
}
