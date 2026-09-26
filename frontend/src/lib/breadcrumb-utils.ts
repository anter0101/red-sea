import { actions, moduleDetails, modules, nestedRoutes } from '@/config/routes';

export type BreadcrumbItemData = {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
};

/**
 * Checks if a path segment is a dynamic ID (numeric or UUID-like)
 */
export function isDynamicSegment(segment: string): boolean {
  return /^\d+$/.test(segment) || /^[a-f0-9-]{8,}$/i.test(segment);
}

/**
 * Gets the appropriate label for a path segment based on context
 */
export function getSegmentLabel(segment: string, previousSegment: string | null): string {
  if (segment in actions) {
    return actions[segment as keyof typeof actions];
  }

  if (segment in modules) {
    return modules[segment as keyof typeof modules];
  }

  if (segment in nestedRoutes) {
    return nestedRoutes[segment as keyof typeof nestedRoutes];
  }

  if (isDynamicSegment(segment) && previousSegment) {
    if (previousSegment in moduleDetails) {
      return moduleDetails[previousSegment as keyof typeof moduleDetails];
    }
  }

  return segment;
}

/**
 * Resolves breadcrumb href for a segment.
 * Uses paths without locale — next-intl Link adds the locale prefix.
 */
export function resolveBreadcrumbHref(filteredParts: string[], index: number): string {
  const segment = filteredParts[index];
  const parent = index > 0 ? filteredParts[index - 1] : null;
  const grandparent = index > 1 ? filteredParts[index - 2] : null;

  // /branches/{id}/employees has no index page — link to branch detail instead.
  if (
    segment === 'employees' &&
    parent &&
    isDynamicSegment(parent) &&
    grandparent === 'branches'
  ) {
    return `/branches/${parent}`;
  }

  const pathParts = filteredParts.slice(0, index + 1);
  return `/${pathParts.join('/')}`;
}

/**
 * Builds breadcrumb items from the current pathname (may include locale prefix).
 */
export function buildBreadcrumbItems(pathname: string): BreadcrumbItemData[] {
  const parts = pathname.split('/').filter(Boolean);
  const filteredParts = parts.filter((part) => part !== 'ar' && part !== 'en');

  if (filteredParts.length === 0) {
    return [];
  }

  const items: BreadcrumbItemData[] = [];

  filteredParts.forEach((part, index) => {
    const previousSegment = index > 0 ? filteredParts[index - 1] : null;
    const isLast = index === filteredParts.length - 1;
    const label = getSegmentLabel(part, previousSegment);

    items.push({
      label,
      href: isLast ? undefined : resolveBreadcrumbHref(filteredParts, index),
      isCurrentPage: isLast,
    });
  });

  return items;
}

/**
 * Determines the current locale from pathname
 */
export function getLocaleFromPath(pathname: string): 'ar' | 'en' {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en') return 'en';
  return 'ar';
}
