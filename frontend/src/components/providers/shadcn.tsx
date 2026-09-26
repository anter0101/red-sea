'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';

type ShadcnProviderProps = {
  children: ReactNode;
  locale: string;
};

export function ShadcnProvider({ children, locale }: ShadcnProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <DirectionProvider dir={locale === 'ar' ? 'rtl' : 'ltr'}>{children}</DirectionProvider>
    </ThemeProvider>
  );
}
