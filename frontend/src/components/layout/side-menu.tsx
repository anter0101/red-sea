'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { icons, sideMenuIcons } from '@/utils/icons';

import { filterMenuByRole } from './filter-menu-by-role';

export { filterMenuByRole };

export default function SideMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cleanPath = pathname.replace(/^\/(ar|en)/, '');
  const items = filterMenuByRole(
    sideMenuIcons,
    (session?.user as { role?: string } | undefined)?.role,
  );
  return (
    <aside
      className="flex min-h-[calc(100vh+80px)] w-20 shrink-0 flex-col items-center gap-6 border-r border-border bg-sidebar py-8"
      aria-label="التنقل الرئيسي"
    >
      {items.map(({ key, alt, href, subItems }) => {
        const isActive = cleanPath.startsWith(href);

        const LinkContent = (
          <div
            className={cn(
              'flex w-full flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-colors',
              isActive ? 'text-[#00810D]' : 'text-side-icon hover:bg-white/40',
            )}
          >
            <Image
              src={icons[key]}
              alt={alt}
              width={24}
              height={24}
              className={cn(
                'size-6 object-contain',
                isActive ? 'side-menu-icon-active' : 'side-menu-icon',
              )}
            />
            <span className="mt-1.5 max-w-full truncate px-0.5 text-[10px] font-medium leading-tight">
              {alt}
            </span>
          </div>
        );

        if (subItems && subItems.length > 0) {
          return (
            <Popover key={key}>
              <PopoverTrigger className="w-full focus:outline-none">{LinkContent}</PopoverTrigger>
              <PopoverContent side="left" className="w-48 border-border bg-card p-2 shadow-md">
                <div className="flex flex-col gap-1">
                  <div className="mb-1 border-b border-border px-2 pb-2 text-sm font-bold text-foreground">
                    {alt}
                  </div>
                  {subItems.map((sub, idx) => (
                    <Link
                      key={idx}
                      href={sub.href}
                      className="block rounded-md p-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {sub.alt}
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        }

        return (
          <Link key={key} href={`${href}`} className="w-full">
            {LinkContent}
          </Link>
        );
      })}
    </aside>
  );
}
