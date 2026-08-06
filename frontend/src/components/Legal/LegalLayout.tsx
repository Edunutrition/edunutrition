import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PlateLogo } from '@/components/Illustrations/PlateMark';

export function LegalLayout({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="mt-6 flex items-center gap-2.5">
          <PlateLogo className="h-8 w-8" />
          <span className="font-display text-base font-semibold text-foreground">EduNutrition</span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Dernière mise à jour : {updatedAt}</p>

        <div className="mt-6 rounded-xl border border-corn-400/40 bg-corn-100/40 px-4 py-3 text-xs leading-relaxed text-foreground">
          <strong>À lire avant publication :</strong> ce document est un modèle de départ rédigé pour poser une
          structure correcte — il doit être relu et validé par un·e avocat·e spécialisé·e en droit suisse avant
          d’être présenté comme définitif, en particulier sur le traitement des données d’élèves mineurs et les
          transferts de données hors de Suisse.
        </div>

        <div className="prose-content mt-8 space-y-6 text-sm leading-relaxed text-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3 [&_ul]:mb-3">
          {children}
        </div>
      </div>
    </div>
  );
}
