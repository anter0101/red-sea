/// <reference lib="webworker" />
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_URL = '/offline.html';
const ICON_CACHE_MAX_ENTRIES = 16;

// Pages, RSC payloads, auth, and backend calls carry session data. They are
// never cached, so an expired or logged-out session cannot be replayed offline.
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ sameOrigin }) => !sameOrigin,
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith('/api/'),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith('/_next/static/'),
    handler: new CacheFirst({ cacheName: 'next-static' }),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith('/icons/'),
    handler: new CacheFirst({
      cacheName: 'pwa-icons',
      plugins: [new ExpirationPlugin({ maxEntries: ICON_CACHE_MAX_ENTRIES })],
    }),
  },
  {
    matcher: () => true,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
