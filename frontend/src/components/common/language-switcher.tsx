'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeLanguage(newLocale: string, searchParams: URLSearchParams | null) {
    startTransition(() => {
      const params = searchParams?.toString();
      const url = params ? `${pathname}?${params}` : pathname;

      router.replace(url, { locale: newLocale });
    });
  }
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => changeLanguage(locale === 'ar' ? 'en' : 'ar', searchParams)}
        className="rounded-full transition-all duration-200 hover:text-white hover:bg-primary font-medium text-primary border-1 border-primary cursor-pointer"
      >
        {locale === 'ar' ? 'En' : 'Ar'}
      </Button>
    </div>
  );
}
