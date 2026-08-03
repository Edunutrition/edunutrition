import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Apple, Bread, Broccoli, Carrot } from '@/components/Illustrations/Produce';
import { PlateProgress } from '@/components/Illustrations/PlateMark';

const CATEGORY_ICON: Record<string, (props: { className?: string }) => JSX.Element> = {
  basics: Apple,
  sports: Carrot,
  diabetes: Broccoli,
  marketing: Bread,
};

export const LEVEL_LABEL: Record<string, string> = {
  co: 'Cycle d’orientation',
  gymnasium: 'Gymnase',
  university: 'Université',
};

export interface ModuleSummary {
  id: string;
  title: string;
  description: string | null;
  level: 'co' | 'gymnasium' | 'university' | string;
  category: string;
  duration_minutes: number | null;
  progress_percent?: number;
}

export function ModuleCard({ module, index = 0 }: { module: ModuleSummary; index?: number }) {
  const Icon = CATEGORY_ICON[module.category] ?? Apple;

  return (
    <motion.a
      href={`/modules/${module.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
          <Icon className="h-6 w-6" />
        </div>
        <PlateProgress percent={module.progress_percent ?? 0} size={44} />
      </div>

      <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
        {module.title}
      </h3>
      {module.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{module.description}</p>
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
        <span>{LEVEL_LABEL[module.level] ?? module.level}</span>
        {module.duration_minutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {module.duration_minutes} min
          </span>
        )}
      </div>
    </motion.a>
  );
}
