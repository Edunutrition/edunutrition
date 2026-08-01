import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Échec de la connexion');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary"
          {...register('email')}
        />
        {errors.email && <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {formError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition-colors hover:bg-basil-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
