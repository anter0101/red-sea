'use client';

import Link from 'next/link';

import {
  JOURNEY_STATUS_COLORS,
  JOURNEY_STATUS_LABELS,
} from '@/features/trips/constants/journey-status';
import type { JourneyStats } from '@/features/trips/api/get-journey-stats';

type JourneyPipelineProps = {
  journeyStats?: JourneyStats;
  isLoading?: boolean;
};

export function JourneyPipeline({ journeyStats, isLoading }: JourneyPipelineProps) {
  const byStatus = journeyStats?.byStatus ?? [];
  const total = journeyStats?.journeyCount || byStatus.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <section className="space-y-3" dir="rtl">
      <h2 className="text-lg font-semibold text-foreground">مسار الرحلات</h2>
      <p className="text-sm text-muted-foreground">توزيع الحالات في الفترة المحددة</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري التحميل…</p>
      ) : byStatus.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد رحلات في هذه الفترة</p>
      ) : (
        <div className="flex flex-col gap-2">
          {byStatus.map((row) => {
            const label = JOURNEY_STATUS_LABELS[row.status] ?? row.status;
            const color = JOURNEY_STATUS_COLORS[row.status] ?? '#94a3b8';
            const pct = Math.max(4, Math.round((row.count / total) * 100));
            return (
              <Link
                key={row.status}
                href={`/trips?tripStatus=${encodeURIComponent(row.status)}`}
                className="rounded-lg border border-border bg-background p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 text-sm mb-2">
                  <span className="font-medium">{label}</span>
                  <span className="tabular-nums text-muted-foreground">{row.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
