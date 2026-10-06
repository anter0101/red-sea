export type DashboardRangePreset = 'today' | 'week' | 'month';

function toLocalDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getDashboardDateRange(preset: DashboardRangePreset): {
  createdAtFrom: string;
  createdAtTo: string;
  dateFrom: string;
  dateTo: string;
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
    dateFrom: toLocalDateString(from),
    dateTo: toLocalDateString(to),
  };
}

export const RANGE_LABELS: Record<DashboardRangePreset, string> = {
  today: 'اليوم',
  week: 'آخر 7 أيام',
  month: 'آخر 30 يوماً',
};
