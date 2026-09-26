export const LOCALES = ['ar', 'en'] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'ar';

/** Path segments (without locale) that do not require a session. */
export const PUBLIC_PAGE_SEGMENTS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/images',
  '/favicon.ico',
] as const;

export function pathnameHasLocale(pathname: string): boolean {
  return new RegExp(`^/(?:${LOCALES.join('|')})(?:/|$)`).test(pathname);
}

export function localeFromPathname(pathname: string): AppLocale {
  const segment = pathname.split('/')[1];
  return LOCALES.includes(segment as AppLocale) ? (segment as AppLocale) : DEFAULT_LOCALE;
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PAGE_SEGMENTS.some((page) => pathname.includes(page));
}

export function homeForRole(role: string | undefined): string {
  return role?.toUpperCase() === 'DATA_ENTRY' ? 'office' : 'home';
}

export function loginPath(locale: string = DEFAULT_LOCALE): string {
  return `/${locale}/login`;
}
