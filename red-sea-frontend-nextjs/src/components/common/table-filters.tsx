'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { CalendarIcon, ChevronDownIcon, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn, createQueryString } from '@/lib/utils';
import { useDebounce } from '@/hooks/debounce';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface TableFiltersProps {
  children?: React.ReactNode;
  showSearch?: boolean;
  showDatePicker?: boolean;
  applyDefaultDateRange?: boolean;
}

const QUICK_PRESETS = (t: (key: string) => string) =>
  [
    { id: 'today', labelKey: t('today') },
    { id: 'yesterday', labelKey: t('yesterday') },
    { id: 'last3', labelKey: t('last3') },
    { id: 'last7', labelKey: t('last7') },
    { id: 'lastWeek', labelKey: t('last-week') },
  ] as const;

function FiltersContent({
  children,
  showSearch = true,
  showDatePicker = true,
  applyDefaultDateRange = false,
}: TableFiltersProps) {
  const locale = useLocale();
  const t = useTranslations('common.filters');
  const dateFnsLocale = locale === 'ar' ? ar : enUS;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get('createdAtFrom');
  const toParam = searchParams.get('createdAtTo');

  // Default range: Jan 1 of current year → end of today
  const defaultFrom = applyDefaultDateRange ? startOfYear(new Date()) : undefined;
  const defaultTo = applyDefaultDateRange ? endOfDay(new Date()) : undefined;

  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: fromParam ? new Date(fromParam) : defaultFrom,
    to: toParam ? new Date(toParam) : defaultTo,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Push default date range to URL on first mount when no params are present
  useEffect(() => {
    if (applyDefaultDateRange && !fromParam && !toParam && defaultFrom && defaultTo) {
      router.replace(
        pathname +
          '?' +
          createQueryString(searchParams, {
            createdAtFrom: defaultFrom.toISOString(),
            createdAtTo: defaultTo.toISOString(),
          }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyDefaultDateRange]);

  useEffect(() => {
    // Only update if the debounced term string is different from the current URL 'search' prop
    // We treat empty string and null as equivalent by standardizing on null when empty
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearchTerm !== currentSearch) {
      router.push(
        pathname +
          '?' +
          createQueryString(searchParams, { search: debouncedSearchTerm || null, page: 1 }),
      );
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);

    if (range.from && range.to) {
      const fromStr = range.from.toISOString();
      const toStr = range.to.toISOString();
      router.push(
        pathname +
          '?' +
          createQueryString(searchParams, { createdAtFrom: fromStr, createdAtTo: toStr, page: 1 }),
      );
    } else if (!range.from && !range.to) {
      router.push(
        pathname +
          '?' +
          createQueryString(searchParams, { createdAtFrom: null, createdAtTo: null, page: 1 }),
      );
    }
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = endOfDay(today);

    switch (preset) {
      case 'today':
        from = startOfDay(today);
        break;
      case 'yesterday':
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case 'last3':
        from = startOfDay(subDays(today, 2));
        break;
      case 'last7':
        from = startOfDay(subDays(today, 6));
        break;
      case 'lastWeek':
        const weekStartsOn = locale === 'ar' ? 6 : 0;
        from = startOfWeek(subDays(today, 7), { weekStartsOn });
        to = endOfWeek(subDays(today, 7), { weekStartsOn });
        break;
    }

    handleDateChange({ from, to });
    setOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
    setActivePreset(null);
    router.push(pathname);
  };

  return (
    <div className="w-full bg-layout-background rounded-md p-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Default Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          {showSearch && (
            <div className="relative w-full max-w-sm sm:w-64">
              <Input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white px-3 h-10 border-border"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} top-0 h-full px-2 hover:bg-transparent`}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}

          {/* Date Range Picker with Presets */}
          {showDatePicker && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-auto justify-between font-normal bg-white hover:bg-zinc-50 border-border h-10 px-3',
                    !dateRange.from && 'text-muted-foreground',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <span className="text-sm">
                          {format(dateRange.from, 'dd MMM yyyy', { locale: dateFnsLocale })} -{' '}
                          {format(dateRange.to, 'dd MMM yyyy', { locale: dateFnsLocale })}
                        </span>
                      ) : (
                        <span className="text-sm">
                          {format(dateRange.from, 'dd MMM yyyy', { locale: dateFnsLocale })}
                        </span>
                      )
                    ) : (
                      <span className="text-sm">{t('added-date')}</span>
                    )}
                  </div>
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div
                  className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-200"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Presets */}
                  <div
                    className={`flex flex-col gap-1 p-3 bg-zinc-50 sm:w-40 ${locale === 'ar' ? 'border-l' : 'border-r'} border-zinc-200`}
                  >
                    <span className="text-xs font-semibold text-zinc-500 mb-1 px-2">
                      {t('quick-periods')}
                    </span>
                    {QUICK_PRESETS(t).map((preset) => (
                      <Button
                        key={preset.id}
                        variant={activePreset === preset.id ? 'secondary' : 'ghost'}
                        className={cn(
                          'justify-start font-normal text-sm w-full h-8 px-2',
                          activePreset === preset.id &&
                            'bg-primary/10 text-primary hover:bg-primary/20',
                        )}
                        onClick={() => applyPreset(preset.id)}
                      >
                        {preset.labelKey}
                      </Button>
                    ))}
                  </div>
                  {/* Calendar */}
                  <div className="p-3 bg-white">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        setActivePreset(null);
                        if (range) {
                          setDateRange({ from: range.from, to: range.to });
                          if (range.from && range.to) {
                            handleDateChange({ from: range.from, to: range.to });
                          }
                        } else {
                          handleDateChange({ from: undefined, to: undefined });
                        }
                      }}
                      numberOfMonths={2}
                      locale={dateFnsLocale}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Additional Custom Filters (e.g. Select Status) */}
          {children}
        </div>

        {/* Clear Button at the End */}
        <div className={`flex gap-2 ${locale === 'ar' ? 'mr-auto lg:mr-0' : 'ml-auto lg:ml-0'}`}>
          <Button
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary h-10 w-full sm:w-auto"
            variant="outline"
            onClick={clearFilters}
          >
            {t('clear-filters')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TableFilters({
  children,
  showSearch,
  showDatePicker,
  applyDefaultDateRange,
}: TableFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="h-[64px] w-full bg-layout-background rounded-md animate-pulse p-3"></div>
      }
    >
      <FiltersContent
        showSearch={showSearch}
        showDatePicker={showDatePicker}
        applyDefaultDateRange={applyDefaultDateRange}
      >
        {children}
      </FiltersContent>
    </Suspense>
  );
}
