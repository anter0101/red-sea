/** Placeholder for missing values in tables, detail views, and exports. */
export const EMPTY_DISPLAY = '—';

export function orEmptyDisplay(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_DISPLAY;
  }
  return String(value);
}
