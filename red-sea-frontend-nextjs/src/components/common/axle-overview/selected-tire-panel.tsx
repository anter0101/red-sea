'use client';

import type { ReactNode } from 'react';

type SelectedTirePanelProps = {
  title: string;
  positionLabel: string;
  children: ReactNode;
};

export default function SelectedTirePanel({
  title,
  positionLabel,
  children,
}: SelectedTirePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border bg-white shadow-sm">
      <div className="shrink-0 border-b px-4 py-2.5 sm:px-5">
        <p className="text-xs text-muted-foreground">{title}</p>
        <h3 className="text-base font-semibold text-primary sm:text-lg">{positionLabel}</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">{children}</div>
      </div>
    </div>
  );
}
