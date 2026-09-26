export const safeString = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
};

export const safeNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};
