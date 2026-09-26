// src/constants/packing-types.ts

export const PACKING_TYPES = [
  { value: 'JUMBO_BAG', label: 'Jumbo Bag' },
  { value: 'BAGGED', label: 'Bagged' },
  { value: 'LOOSE', label: 'Loose' },
  { value: 'SILO10', label: 'Silo 10' },
  { value: 'SILO12', label: 'Silo 12' },
] as const;

export type PackingType = (typeof PACKING_TYPES)[number]['value'];
