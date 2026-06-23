import { clsx } from 'clsx';

const MATIERE_COLORS: Record<string, string> = {
  Mathématiques: 'bg-blue-50 text-blue-700 border-blue-200',
  Français: 'bg-purple-50 text-purple-700 border-purple-200',
  Conjugaison: 'bg-violet-50 text-violet-700 border-violet-200',
  'Éveil/Sciences': 'bg-sage/10 text-sage border-sage/20',
  Sciences: 'bg-sage/10 text-sage border-sage/20',
  'Histoire-Géographie': 'bg-amber-50 text-amber-700 border-amber-200',
  Histoire: 'bg-amber-50 text-amber-700 border-amber-200',
  Géographie: 'bg-orange-50 text-orange-700 border-orange-200',
};

interface BadgeProps {
  label: string;
  className?: string;
}

export function MatiereBadge({ label, className }: BadgeProps) {
  const color = MATIERE_COLORS[label] ?? 'bg-paper-dark text-ink-soft border-line';
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide',
        color,
        className,
      )}
    >
      {label}
    </span>
  );
}
