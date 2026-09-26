import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CardData = {
  title?: string;
  value?: string | number;
  description?: string;
  icon?: ReactNode;
};

type Props = {
  data?: CardData;
  /** Maps to ledger tab stat palette: primary → #5C8A9F, secondary → #368BAF, success → #42A886, blue → #368BAF */
  color?: 'primary' | 'secondary' | 'success' | 'blue';
  className?: string;
  children?: ReactNode;
};

const COLOR_CLASS: Record<NonNullable<Props['color']>, string> = {
  primary: 'bg-stat-card-1',
  secondary: 'bg-stat-card-2',
  success: 'bg-stat-card-3',
  blue: 'bg-stat-card-2',
};

export default function ReusableCard({ data, color = 'primary', className = '', children }: Props) {
  const bgClass = COLOR_CLASS[color];

  return (
    <div
      className={cn(
        'flex min-h-24 min-w-0 w-full transform items-center justify-between gap-4 rounded-xl p-5 text-white shadow-md transition-all hover:-translate-y-1',
        bgClass,
        className,
      )}
      dir="rtl"
    >
      <div className="flex flex-col items-start gap-1">
        {data?.title && (
          <h2 className="text-sm font-medium text-white/90 break-words">{data.title}</h2>
        )}
        {data?.value !== undefined && (
          <span className="mt-1 text-[1.7rem] leading-none font-bold">{data.value}</span>
        )}
        {data?.description && <span className="text-xs text-white/70">{data.description}</span>}
      </div>

      {data?.icon && (
        <div className="shrink-0 rounded-xl bg-white/20 p-3 opacity-90">{data.icon}</div>
      )}

      {children}
    </div>
  );
}
