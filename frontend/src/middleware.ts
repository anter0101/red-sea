import { NextResponse } from 'next/server';

import { auth } from './app/[locale]/authentication/auth';
import {
  DEFAULT_LOCALE,
  homeForRole,
  isPublicPath,
  localeFromPathname,
  loginPath,
  pathnameHasLocale,
} from './lib/auth-paths';

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (pathname.includes('/api/auth') || pathname.includes('/_next')) {
    return NextResponse.next();
  }

  if (!pathnameHasLocale(pathname)) {
    const url = new URL(`/${DEFAULT_LOCALE}${pathname}`, req.url);
    url.search = search;
    return NextResponse.redirect(url);
  }

  const locale = localeFromPathname(pathname);
  const session = req.auth;
  const publicPage = isPublicPath(pathname);
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn && !publicPage) {
    return NextResponse.redirect(new URL(loginPath(locale), req.url));
  }

  if (isLoggedIn && publicPage) {
    const home = homeForRole(session?.user?.role);
    return NextResponse.redirect(new URL(`/${locale}/${home}`, req.url));
  }

  if (isLoggedIn && pathname === `/${locale}`) {
    const home = homeForRole(session?.user?.role);
    return NextResponse.redirect(new URL(`/${locale}/${home}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|health(?:/|$)).*)'],
};
