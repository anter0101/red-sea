import { EMPTY_DISPLAY } from '@/lib/empty-display';

/** Strip spaces for PlateInput (3 consecutive Arabic letters). */
export function compactPlateLetters(value: string): string {
  return value.replace(/\s+/g, '').trim();
}

/** API format: spaced Arabic letters e.g. "ن ل ن". */
export function formatPlateLettersForApi(value: string): string {
  const compact = compactPlateLetters(value);
  if (!compact) return '';
  return compact.split('').join(' ');
}

/** Display format: spaced letters so Arabic does not join cursively on screen. */
export function formatPlateLettersForDisplay(
  value: string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_DISPLAY;
  }
  const compact = compactPlateLetters(value);
  if (!compact) return EMPTY_DISPLAY;
  return compact.split('').join(' ');
}
