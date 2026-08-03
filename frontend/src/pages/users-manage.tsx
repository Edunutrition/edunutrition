import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmptyState } from '@/components/Dashboard/EmptyState';
import { RoleLayout } from '@/components/Dashboard/RoleLayout';
import { apiFetch } from '@/lib/api';

interface UserRow {
  id: string;
  role: 'admin' | 'teacher' | 'nurse' | 'student';
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

const ROLE_LABEL: Record<UserRow['role'], string> = {
  admin: 'Administrateur·rice',
  teacher: 'Enseignant·e',
  nurse: 'Infirmier·ère',
  student: 'Élève',
};

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  role: z.enum(['admin', 'teacher', 'nurse', 'student']),
});

type InviteValues = z.infer<typeof inviteSchema>;

export default function UsersManagePage() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery<UserRow[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/api/users'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { role: 'student' } });

  const invite = useMutation({
    mutationFn: (values: InviteValues) => apiFetch('/api/users/invite', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
      setShowInvite(false);
      setInviteError(null);
    },
    onError: (err: Error) => setInviteError(err.message),
  });

  return (
    <RoleLayout
      theme="admin"
      title="Utilisateurs"
      subtitle="Les comptes rattachés à ton école."
      navItems={[
        { label: 'Aperçu', href: '/admin', icon: <Users className="h-4 w-4" /> },
        { label: 'Utilisateurs', href: '/users/manage', icon: <Mail className="h-4 w-4" /> },
      ]}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users?.length ?? 0} compte{(users?.length ?? 0) > 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card"
        >
          {showInvite ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showInvite ? 'Annuler' : 'Inviter quelqu’un'}
        </button>
      </div>

      {showInvite && (
        <form
          onSubmit={handleSubmit((values) => invite.mutate(values))}
          className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:grid-cols-2"
        >
          <div>
            <label className="block text-xs font-medium text-foreground">Prénom</label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
              {...register('first_name')}
            />
            {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground">Nom</label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
              {...register('last_name')}
            />
            {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground">Rôle</label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary"
              {...register('role')}
            >
              {Object.entries(ROLE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {inviteError && <p className="text-sm text-destructive sm:col-span-2">{inviteError}</p>}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || invite.isPending}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {invite.isPending ? 'Envoi de l’invitation…' : 'Envoyer l’invitation'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        )}

        {!isLoading && users?.length === 0 && (
          <EmptyState
            icon={<Users className="h-7 w-7 text-primary" />}
            title="Personne pour l’instant"
            description="Invite tes collègues et tes élèves pour qu’ils rejoignent ton école."
          />
        )}

        {!isLoading && users && users.length > 0 && (
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 shadow-card"
              >
                <span className="text-sm font-medium text-foreground">
                  {u.first_name} {u.last_name}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {ROLE_LABEL[u.role]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RoleLayout>
  );
}
