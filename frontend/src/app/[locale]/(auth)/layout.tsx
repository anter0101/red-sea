import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

// import Header from "@/components/layout/header";
import Provider from '@/components/providers/main';
import { getLocaleMessages } from '@/i18n/i18n-helpers';
import type { IPageProps } from '@/types/types';
import { baseMetadata } from '@/utils/base-metadata';
import { PWA_THEME_COLOR } from '@/utils/pwa';

import '@/styles/globals.css';

export async function generateMetadata({ params }: IPageProps): Promise<Metadata> {
  const { locale } = await params;
  const commonMessages = await getLocaleMessages(locale, 'common');

  return baseMetadata(locale, {
    title: commonMessages.name,
    description: commonMessages['document-management-system'],
  });
}

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: PWA_THEME_COLOR,
  };
}

export default async function LocaleLayout({ children, params }: IPageProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  return (
    <Provider locale={locale}>
      {/* <Header /> */}
      <div className="w-full full-h-without-header-footer bg-cover bg-center flex items-center justify-center">
        {children}
      </div>
    </Provider>
  );
}
