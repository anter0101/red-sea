'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import { localeFromPathname, loginPath } from '@/lib/auth-paths';

function logoutAndGoToLogin() {
  const locale = localeFromPathname(window.location.pathname);
  void fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
    window.location.replace(loginPath(locale));
  });
}

/** Logs the user out when the 6-hour session ends, including on an open tab. */
export default function SessionExpiryGuard() {
  const { data, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      logoutAndGoToLogin();
      return;
    }

    if (status !== 'authenticated' || !data?.expires) return;

    const remaining = new Date(data.expires).getTime() - Date.now();
    if (remaining <= 0) {
      logoutAndGoToLogin();
      return;
    }

    const timer = window.setTimeout(logoutAndGoToLogin, remaining);
    return () => window.clearTimeout(timer);
  }, [data?.expires, status]);

  return null;
}
