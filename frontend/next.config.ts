import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // The image copies .next/standalone. That step recreates pnpm symlinks, which
  // Windows blocks unless Developer Mode is on. The Docker build is Linux.
  output: process.platform === 'win32' ? undefined : 'standalone',
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dms-tenant.s3.us-west-2.amazonaws.com',
      },
    ],
  },
};

// Serwist hooks webpack. `next dev` runs Turbopack, so the worker is built only
// by `next build`.
const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  register: false,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV !== 'production',
  globPublicPatterns: ['icons/*', 'offline.html'],
});

const withNextIntl = createNextIntlPlugin();
export default withSerwist(withNextIntl(nextConfig));
