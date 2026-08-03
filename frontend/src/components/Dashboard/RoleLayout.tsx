import { LogOut, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PlateLogo } from '@/components/Illustrations/PlateMark';
import { useAuth } from '@/hooks/useAuth';

export type RoleTheme = 'student' | 'school' | 'admin';

const THEME_LABEL: Record<RoleTheme, string> = {
  student: 'Espace élève',
  school: 'Espace école',
  admin: 'Administration',
};

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export function RoleLayout({
  theme,
  navItems,
  title,
  subtitle,
  children,
}: {
  theme: RoleTheme;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 pb-6 pt-5">
        <PlateLogo />
        <div>
          <p className="font-display text-sm font-semibold leading-none text-primary-foreground">
            EduNutrition
          </p>
          <p className="mt-1 text-xs text-primary-foreground/70">{THEME_LABEL[theme]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) =>
          item.href.startsWith('#') ? (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {item.icon}
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <div className="mx-3 mb-4 mt-6 rounded-lg bg-primary-foreground/10 px-3 py-3">
        <p className="truncate text-sm font-medium text-primary-foreground">
          {profile?.first_name} {profile?.last_name}
        </p>
        <button
          onClick={logout}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-foreground/70 hover:text-primary-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Se déconnecter
        </button>
      </div>
    </>
  );

  return (
    <div data-role={theme} className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-primary md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-primary px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <PlateLogo className="h-7 w-7" />
          <span className="font-display text-sm font-semibold text-primary-foreground">
            EduNutrition
          </span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="rounded-md p-1.5 text-primary-foreground/90 hover:bg-primary-foreground/10"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[52px] z-20 flex flex-col bg-primary pb-4 md:hidden">
          {sidebarContent}
        </div>
      )}

      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
