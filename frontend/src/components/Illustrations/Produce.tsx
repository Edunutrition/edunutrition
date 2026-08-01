import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type IconProps = { className?: string; style?: CSSProperties };

/**
 * Small flat, organic-shaped food icons used across empty states, category
 * badges and decorative scatter — the visual vocabulary of the whole app,
 * standing in for the clinical/medical iconography this product deliberately
 * avoids (this is education, not a health portal).
 */

export function Apple({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <path d="M20 15c-1-3-4-4-6-2s-1 6 1 9c1.5 2.2 3 3.5 5 3.5s3.5-1.3 5-3.5c2-3 3-7 1-9s-5 0-6 2z" fill="#C94627" />
      <path d="M19.5 15c-.3-2 .3-4 2-5.5" stroke="#5B3A5E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M20 9.5c1.5-1.8 3.5-2 5-1" stroke="#2F6B3E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Carrot({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <path d="M17 14c5-2 10 3 8 8-3 8-9 12-11 14-1 .6-2-.3-1.5-1.4 1.6-3.5 2-11 1-14-.7-2.3 1-5.7 3.5-6.6z" fill="#F0B429" />
      <path d="M18 12c-1-2-3-3-5-2.6M21 11.3c.3-2 2-3.6 4-3.8M15.5 15.2c-1.7-1-3.8-1-5.4 0" stroke="#2F6B3E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Broccoli({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <rect x="18" y="24" width="4" height="10" rx="2" fill="#D6E7D1" />
      <circle cx="14" cy="18" r="6" fill="#2F6B3E" />
      <circle cx="22" cy="14" r="7" fill="#2F6B3E" />
      <circle cx="27" cy="20" r="5.5" fill="#2F6B3E" />
    </svg>
  );
}

export function Bread({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <path d="M8 24c0-8 5.5-13 12-13s12 5 12 13c0 3-2 5-5 5H13c-3 0-5-2-5-5z" fill="#DE9C15" />
      <path d="M14 16.5c.8 2 .8 4 0 6M20 14.5c.8 2.5.8 5 0 7.5M26 16.5c.8 2 .8 4 0 6" stroke="#8A5A12" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

export function WaterGlass({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <path d="M13 10h14l-2 20a2 2 0 0 1-2 1.8H17a2 2 0 0 1-2-1.8L13 10z" fill="#EAF1FF" stroke="#7A527D" strokeWidth="1.5" />
      <path d="M13.8 17h12.4" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.6 24h10.8" stroke="#4A6FA5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function Orange({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('h-8 w-8', className)} style={style} aria-hidden="true">
      <circle cx="20" cy="21" r="10" fill="#EE7B5C" />
      <path d="M20 11c1.2-1.6 3-2.2 4.6-1.8" stroke="#2F6B3E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const ICONS = [Apple, Carrot, Broccoli, Bread, WaterGlass, Orange];

/**
 * Loose, low-opacity arrangement of the produce icons — ambient texture for
 * the login panel and empty states rather than a literal illustration.
 */
export function ProduceScatter({ className, style }: IconProps) {
  const layout = [
    { x: '6%', y: '12%', r: -12, s: 1.1 },
    { x: '78%', y: '8%', r: 10, s: 0.9 },
    { x: '85%', y: '48%', r: -8, s: 1.3 },
    { x: '12%', y: '58%', r: 14, s: 1 },
    { x: '50%', y: '80%', r: -6, s: 1.15 },
    { x: '30%', y: '30%', r: 8, s: 0.8 },
  ];

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {layout.map((pos, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <Icon
            key={i}
            className="absolute h-10 w-10 opacity-[0.16]"
            style={{
              left: pos.x,
              top: pos.y,
              transform: `rotate(${pos.r}deg) scale(${pos.s})`,
            }}
          />
        );
      })}
    </div>
  );
}
