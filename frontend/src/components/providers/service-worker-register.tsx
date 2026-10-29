'use client';

import { useEffect } from 'react';

/** Registers the production service worker. Dev builds do not emit one. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }, []);

  return null;
}
