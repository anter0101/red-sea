import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import ServiceWorkerRegister from '@/components/providers/service-worker-register';
import { ShadcnProvider } from '@/components/providers/shadcn';
import queryClient from '@/lib/query-client';
import { cn } from '@/lib/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { auth } from '../../app/[locale]/authentication/auth';

import '@/styles/globals.css';

type Props = Readonly<{
  children: ReactNode;
  locale: string;
}>;

export default async function Provider({ children, locale }: Readonly<Props>) {
  const messages = await getMessages({
    locale,
  });
  const session = await auth();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={cn('bg-white')}>
        <ServiceWorkerRegister />
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />

              <ShadcnProvider locale={locale}>
                {children}
                <ToastContainer position={locale === 'ar' ? 'bottom-left' : 'bottom-right'} />
              </ShadcnProvider>
            </QueryClientProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
