'use client';

import {
  RANGE_LABELS,
  type DashboardRangePreset,
} from '@/features/dashboard/utils/date-range';
import { Button } from '@/components/ui/button';

type DashboardToolbarProps = {
  range: DashboardRangePreset;
  onRangeChange: (range: DashboardRangePreset) => void;
};

const PRESETS: DashboardRangePreset[] = ['today', 'week', 'month'];

export function DashboardToolbar({ range, onRangeChange }: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">البحر الأحمر</h1>
        <p className="text-sm text-muted-foreground mt-1">لوحة متابعة العمليات — {RANGE_LABELS[range]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={range === preset ? 'default' : 'outline'}
            onClick={() => onRangeChange(preset)}
          >
            {RANGE_LABELS[preset]}
          </Button>
        ))}
      </div>
    </div>
  );
}
