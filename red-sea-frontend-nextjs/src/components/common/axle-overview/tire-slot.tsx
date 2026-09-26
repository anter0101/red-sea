'use client';

import { cn } from '@/lib/utils';

type TireSlotProps = {
  label: string;
  selected?: boolean;
  filled?: boolean;
  hasError?: boolean;
  onClick: () => void;
};

export default function TireSlot({
  label,
  selected = false,
  filled = false,
  hasError = false,
  onClick,
}: TireSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        'relative flex h-16 w-9 shrink-0 flex-col items-center justify-center rounded-full border-2 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        filled ? 'bg-slate-700 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-500',
        selected && 'ring-2 ring-primary ring-offset-2 border-primary scale-105',
        hasError && !selected && 'border-destructive bg-red-50 text-destructive',
        hasError && selected && 'ring-destructive',
      )}
    >
      <span className="pointer-events-none absolute inset-y-2 left-1.5 w-px rounded-full bg-current opacity-25" />
      <span className="pointer-events-none absolute inset-y-2 right-1.5 w-px rounded-full bg-current opacity-25" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
