import type { Metadata } from 'next';

// import { logoMain } from "./images";

export const baseMetadata = (locale: string, overrideAttr?: Metadata) => ({
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'DMS',
  description: 'DMS',
  keywords: ['DMS'],
  authors: [{ name: 'DMS Team' }],
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
