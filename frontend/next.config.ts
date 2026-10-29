import type { NextConfig } from 'next';
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
