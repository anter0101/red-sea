import type { Metadata, Viewport } from 'next';

import { auth } from '@/app/[locale]/authentication/auth';
import Header from '@/components/layout/header';
import SideMenu from '@/components/layout/side-menu';
import AuthTokenProvider from '@/components/providers/auth-token';
import Provider from '@/components/providers/main';
import { getLocaleMessages } from '@/i18n/i18n-helpers';
import type { IPageComponentProps, IPageProps } from '@/types/types';
import { baseMetadata } from '@/utils/base-metadata';

export async function generateMetadata({ params }: IPageComponentProps): Promise<Metadata> {
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
  };
}

export default async function Layout({ children, params }: IPageProps) {
  const session = await auth();

  const resolvedParams = await params;
  const { locale } = resolvedParams;

  return (
    <Provider locale={locale}>
      <AuthTokenProvider token={session?.token || ''}>
        <Header user={session?.user} />

        <div className="flex min-h-[calc(100vh-5rem)] min-w-0">
          <SideMenu />
          <div className="min-w-0 flex-1 overflow-x-hidden bg-layout-background p-6">{children}</div>
        </div>
      </AuthTokenProvider>
    </Provider>
  );
}
