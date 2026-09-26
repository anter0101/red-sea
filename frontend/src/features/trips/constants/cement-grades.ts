// src/constants/cement-grades.ts

export const CEMENT_GRADES = [
  { value: '32.5', label: '32.5' },
  { value: '42.5', label: '42.5' },
  { value: '52.5', label: '52.5' },
] as const;

export type CementGrade = (typeof CEMENT_GRADES)[number]['value'];
