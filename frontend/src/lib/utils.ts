import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createQueryString(
  searchParams: URLSearchParams | ReadonlyURLSearchParams | string,
  paramsToUpdate: Record<string, string | number | null>,
) {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(paramsToUpdate).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}
