'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Settings } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMenuPreferences } from '@/hooks/menu/use-menu-preferences';
import { cn } from '@/lib/utils';
import { icons, sideMenuIcons } from '@/utils/icons';

import CustomizeMenuDialog from './customize-menu-dialog';
import { filterMenuByRole } from './filter-menu-by-role';
import { applyHiddenMenu, applyMenuOrder } from './menu-preferences';

export { filterMenuByRole };

export default function SideMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cleanPath = pathname.replace(/^\/(ar|en)/, '');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { hidden, order, save } = useMenuPreferences();
  const allowed = filterMenuByRole(
    sideMenuIcons,
    (session?.user as { role?: string } | undefined)?.role,
  );
  const items = applyHiddenMenu(applyMenuOrder(allowed, order), hidden);
  return (
    <aside
      className="flex min-h-[calc(100vh+80px)] w-20 shrink-0 flex-col items-center gap-6 border-r border-border bg-sidebar px-2 py-8"
      aria-label="التنقل الرئيسي"
    >
      {items.map(({ key, alt, href, subItems }) => {
        const isActive = cleanPath.startsWith(href);

        const LinkContent = (
          <div
            className={cn(
              'flex w-full flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-colors',
              isActive
                ? 'bg-success-100 text-success-600'
                : 'text-side-icon hover:bg-white/40',
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
            <span className="mt-1.5 w-full min-w-0 whitespace-normal text-center text-[10px] font-medium leading-tight">
              {alt}
            </span>
          </div>
        );

        const labelTooltip = (
          <TooltipContent side="left" sideOffset={8}>
            {alt}
          </TooltipContent>
        );

        if (subItems && subItems.length > 0) {
          return (
            <Popover key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger className="w-full min-w-0 focus:outline-none">
                    {LinkContent}
                  </PopoverTrigger>
                </TooltipTrigger>
                {labelTooltip}
              </Tooltip>
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
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Link href={`${href}`} className="w-full min-w-0">
                {LinkContent}
              </Link>
            </TooltipTrigger>
            {labelTooltip}
          </Tooltip>
        );
      })}

      <button
        type="button"
        onClick={() => setCustomizeOpen(true)}
        className="text-side-icon mt-auto flex flex-col items-center gap-1 text-[10px] font-medium hover:text-foreground"
        aria-label="تخصيص القائمة"
      >
        <Settings className="size-5" />
        تخصيص
      </button>

      <CustomizeMenuDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        items={allowed}
        prefs={{ hidden, order }}
        isSaving={save.isPending}
        onSave={(next) => save.mutateAsync(next)}
      />
    </aside>
  );
}
