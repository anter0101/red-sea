import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '', // fallback only for build-time
  },
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
