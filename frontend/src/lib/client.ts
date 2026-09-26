import axios from 'axios';

import { isPublicPath, localeFromPathname, loginPath } from '@/lib/auth-paths';

const timeout = 1000 * 60;

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=UTF-8',
    'X-TENANT-ID': 'dms',
  },
  timeout,
});

let isRedirectingToLogin = false;

async function redirectToLoginOnUnauthorized() {
  if (typeof window === 'undefined' || isRedirectingToLogin) {
    return;
  }

  const { pathname } = window.location;
  if (isPublicPath(pathname)) {
    return;
  }

  isRedirectingToLogin = true;

  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Session may already be invalid; still send the user to login.
  }

  window.location.replace(loginPath(localeFromPathname(pathname)));
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await redirectToLoginOnUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default client;
