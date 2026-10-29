import type { Metadata } from 'next';

// import { logoMain } from "./images";

export const baseMetadata = (locale: string, overrideAttr?: Metadata) => ({
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'DMS',
  description: 'DMS',
  keywords: ['DMS'],
  authors: [{ name: 'DMS Team' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'البحر الأحمر',
    statusBarStyle: 'default' as const,
  },
  openGraph: {
    type: 'website',
    locale: locale,
    alternateLocale: locale === 'en' ? 'ar' : 'en',
    siteName: 'DMS',
    // images: [
    //   {
    //     url: logoMain.src,
    //     width: 1200
    //     height: 630,
    //   },
    // ],
  },
  twitter: {
    card: 'summary',
    title: 'DMS',
    description: 'DMS',
    // images: [logoMain.src],
  },
  alternates: {
    canonical: `/${locale}`,
    languages: {
      en: '/en',
      ar: '/ar',
    },
  },
  robots: {
    index: false,
    follow: false,
  },
  ...overrideAttr,
});
