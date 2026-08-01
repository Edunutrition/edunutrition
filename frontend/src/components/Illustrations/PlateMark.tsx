import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The brand mark: a flat rendering of "l'assiette équilibrée" — the balanced-plate
 * model taught in Swiss nutrition classes (~half vegetables, a quarter starch, a
 * quarter protein). Used as the app logo and, as PlateProgress below, doubles as
 * every progress indicator in the product — the plate literally fills up as a
 * student works through a module.
 */
export function PlateLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn('h-8 w-8', className)} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#FDFDF9" stroke="#E4E9DA" strokeWidth="2" />
      <path d="M24 24 L24 4 A20 20 0 0 1 41.32 34 Z" fill="#F0B429" />
      <path d="M24 24 L41.32 34 A20 20 0 0 1 6.68 34 Z" fill="#2F6B3E" />
      <path d="M24 24 L6.68 34 A20 20 0 0 1 24 4 Z" fill="#E85D3D" />
      <circle cx="24" cy="24" r="7.5" fill="#FDFDF9" />
    </svg>
  );
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PlateProgress({
  percent,
  size = 64,
  label,
  className,
}: {
  percent: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} className="-rotate-90">
        <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        {/* faint compartment ticks, echoing the plate mark's three wedges */}
        {[0, 120, 240].map((deg) => (
          <line
            key={deg}
            x1="32"
            y1="6"
            x2="32"
            y2="12"
            stroke="hsl(var(--muted-foreground) / 0.3)"
            strokeWidth="2"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
        <motion.circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {clamped >= 100 ? (
          <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />
        ) : (
          <span className="font-mono text-xs font-medium text-foreground">
            {label ?? `${Math.round(clamped)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
