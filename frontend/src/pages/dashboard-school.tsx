import { BarChart3, BookOpen, GraduationCap, Home, TrendingUp, Users } from 'lucide-react';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { RoleLayout } from '@/components/Dashboard/RoleLayout';
import { StatTile } from '@/components/Dashboard/StatTile';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardSchoolPage() {
  const { profile } = useAuth();

  return (
    <RoleLayout
      theme="school"
      title="Tableau de bord école"
      subtitle={`Bienvenue ${profile?.first_name ?? ''}, voici l’activité de ton école.`}
      navItems={[
        { label: 'Aperçu', href: '#apercu', icon: <Home className="h-4 w-4" /> },
        { label: 'Modules', href: '/modules/manage', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Élèves', href: '#eleves', icon: <Users className="h-4 w-4" /> },
        { label: 'Statistiques', href: '#stats', icon: <BarChart3 className="h-4 w-4" /> },
      ]}
    >
      <section id="apercu" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={<Users className="h-4 w-4" />} label="Élèves inscrits" value="—" hint="Bientôt disponible" />
        <StatTile icon={<GraduationCap className="h-4 w-4" />} label="Modules utilisés" value="—" hint="Bientôt disponible" />
        <StatTile icon={<TrendingUp className="h-4 w-4" />} label="Taux de complétion" value="—" hint="Bientôt disponible" />
      </section>

      <section id="eleves" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Élèves</h2>
        <div className="mt-4">
          <EmptyState
            icon={<Users className="h-7 w-7 text-primary" />}
            title="Aucun élève à afficher pour l’instant"
            description="Dès que des comptes seront rattachés à ton école, tu retrouveras les statistiques de chaque élève ici."
          />
        </div>
      </section>
    </RoleLayout>
  );
}
