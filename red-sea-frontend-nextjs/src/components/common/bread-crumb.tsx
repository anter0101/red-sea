'use client';

import { Home, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/navigation';
import { buildBreadcrumbItems, getLocaleFromPath } from '@/lib/breadcrumb-utils';
import { cn } from '@/lib/utils';
import { usePathname } from '@/i18n/navigation';

interface AppBreadcrumbProps {
  homeHref?: string;
  className?: string;
}

export default function AppBreadcrumb({ homeHref = '/', className }: Readonly<AppBreadcrumbProps>) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const isRTL = locale === 'ar';

  const items = buildBreadcrumbItems(pathname);

  const SeparatorIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Breadcrumb className={cn('', className)}>
      <BreadcrumbList className="text-breadcrumb-muted">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href={homeHref}
              className="flex items-center text-breadcrumb-muted transition-colors hover:text-white"
              aria-label={isRTL ? 'الصفحة الرئيسية' : 'Home'}
            >
              <Home className="size-6" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <div key={index} className="contents">
            <BreadcrumbSeparator className="text-breadcrumb-muted/70">
              <SeparatorIcon className="size-6" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage className="text-xl font-semibold text-white">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href!}
                    className="text-xl font-medium text-breadcrumb-muted transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
