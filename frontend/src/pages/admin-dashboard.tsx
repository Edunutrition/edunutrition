import { useQuery } from '@tanstack/react-query';
import { BookOpen, Building2, Home, Settings, ShieldCheck, Users } from 'lucide-react';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { RoleLayout } from '@/components/Dashboard/RoleLayout';
import { StatTile } from '@/components/Dashboard/StatTile';
import { apiFetch } from '@/lib/api';

export default function AdminDashboardPage() {
  const { data: users } = useQuery<unknown[]>({ queryKey: ['users'], queryFn: () => apiFetch('/api/users') });

  return (
    <RoleLayout
      theme="admin"
      title="Administration"
      subtitle="Gère les écoles, les comptes et les abonnements."
      navItems={[
        { label: 'Aperçu', href: '#apercu', icon: <Home className="h-4 w-4" /> },
        { label: 'Modules', href: '/modules/manage', icon: <BookOpen className="h-4 w-4" /> },
        { label: 'Utilisateurs', href: '/users/manage', icon: <Users className="h-4 w-4" /> },
        { label: 'Écoles', href: '#ecoles', icon: <Building2 className="h-4 w-4" /> },
        { label: 'Paramètres', href: '#parametres', icon: <Settings className="h-4 w-4" /> },
      ]}
    >
      <section id="apercu" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={<Building2 className="h-4 w-4" />} label="Écoles actives" value="—" hint="Bientôt disponible" />
        <StatTile icon={<Users className="h-4 w-4" />} label="Utilisateurs" value={users ? String(users.length) : '—'} />
        <StatTile icon={<ShieldCheck className="h-4 w-4" />} label="Abonnements actifs" value="—" hint="Bientôt disponible" />
      </section>

      <section id="ecoles" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Écoles</h2>
        <div className="mt-4">
          <EmptyState
            icon={<Building2 className="h-7 w-7 text-primary" />}
            title="Aucune école enregistrée"
            description="Ajoute ta première école pour pouvoir inviter enseignant·e·s, infirmier·ère·s et élèves."
          />
        </div>
      </section>
    </RoleLayout>
  );
}
