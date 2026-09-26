'use client';

import { usePathname } from 'next/navigation';

const ACTIONS = ['create', 'update', 'edit'];

export function usePageKey(): string {
  const pathname = usePathname();

  if (!pathname) {
    return '';
  }

  /**
   * Example:
   * /ar/trips/create -> ["ar", "trips", "create"]
   */
  const parts = pathname.split('/').filter(Boolean);

  /**
   * Remove locale if exists
   */
  const [, module] = parts;

  if (!module) {
    return '';
  }

  /**
   * Ignore action-based routes
   */
  if (ACTIONS.includes(module)) {
    return '';
  }

  return module;
}
