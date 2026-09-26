export type DashboardRangePreset = 'today' | 'week' | 'month';

export function getDashboardDateRange(preset: DashboardRangePreset): {
  createdAtFrom: string;
  createdAtTo: string;
} {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  const from = new Date();
  from.setHours(0, 0, 0, 0);

  if (preset === 'week') {
    from.setDate(from.getDate() - 6);
  } else if (preset === 'month') {
    from.setMonth(from.getMonth() - 1);
    from.setDate(from.getDate() + 1);
  }

  return {
    createdAtFrom: from.toISOString(),
    createdAtTo: to.toISOString(),
  };
}

export const RANGE_LABELS: Record<DashboardRangePreset, string> = {
  today: 'اليوم',
  week: 'آخر 7 أيام',
  month: 'آخر 30 يوماً',
};
