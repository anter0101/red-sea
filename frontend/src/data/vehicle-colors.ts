export const VehicleColors = (t: (key: string) => string) => [
  { label: t('white'), value: 'white' },
  { label: t('blue'), value: 'blue' },
  { label: t('green'), value: 'green' },
  { label: t('yellow'), value: 'yellow' },
  { label: t('red'), value: 'red' },
  { label: t('silver'), value: 'silver' },
  { label: t('gray'), value: 'gray' },
  { label: t('black'), value: 'black' },
];

/** Backend may store "Silver" while i18n keys are lowercase. */
export function translateVehicleColor(
  t: ((key: string) => string) & { has?: (key: string) => boolean },
  color: string | null | undefined,
  fallback = '',
): string {
  if (!color) return fallback;
  const key = color.toLowerCase();
  if (t.has && !t.has(key)) return color;
  return t(key);
}
