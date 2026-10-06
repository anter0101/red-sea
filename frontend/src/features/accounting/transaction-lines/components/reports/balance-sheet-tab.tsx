'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, CalendarIcon, X, ChevronDown, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import ExportButton from '@/components/common/export-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createQueryString } from '@/lib/utils';
import { useExportRows } from '@/hooks/use-export-rows';

import {
  useGetBalanceSheet,
  type IBalanceSheetLine,
  type IBalanceSheetTreeNode,
} from '../../../reports/api';
import {
  balanceSheetExportColumns,
  buildBalanceSheetExportRows,
} from '../../../reports/export.helpers';

function AsOfDatePicker() {
  const locale = useLocale();
  const dateFnsLocale = locale === 'ar' ? ar : enUS;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const asOfParam = searchParams.get('asOf');
  const selected = asOfParam ? new Date(asOfParam) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      router.push(
        pathname + '?' + createQueryString(searchParams, { asOf: format(date, 'yyyy-MM-dd') }),
      );
    }
    setOpen(false);
  };

  const handleClear = () => {
    router.push(pathname + '?' + createQueryString(searchParams, { asOf: null }));
  };

  return (
    <div className="w-full bg-cyan-50 rounded-md p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
          {locale === 'ar' ? 'بتاريخ' : 'As of'}
        </span>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-52 justify-start font-normal bg-white hover:bg-zinc-50 border-sky-100 h-10 px-3 gap-2',
                !selected && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="h-4 w-4 text-sky-600 shrink-0" />
              <span className="text-sm">
                {selected
                  ? format(selected, 'dd MMM yyyy', { locale: dateFnsLocale })
                  : locale === 'ar'
                    ? 'اختر تاريخ'
                    : 'Pick a date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              locale={dateFnsLocale}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {selected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 px-2 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function BalanceSheetTreeRow({
  node,
  depth = 0,
  formatAmount,
}: {
  node: IBalanceSheetTreeNode;
  depth?: number;
  formatAmount: (n: number) => string;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isParent = hasChildren;

  return (
    <>
      <TableRow
        className={`hover:bg-slate-50/50 h-12 border-none ${isParent ? 'bg-slate-50/80 cursor-pointer' : ''}`}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
      >
        <TableCell
          className={`${isParent ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}
        >
          <div className="flex items-center gap-1" style={{ paddingRight: `${depth * 20}px` }}>
            {hasChildren && (
              <span className="text-slate-400 shrink-0">
                {expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </span>
            )}
            <span>{node.accountName}</span>
          </div>
        </TableCell>
        <TableCell
          className={`font-medium w-32 ${isParent ? 'font-bold text-slate-800' : 'text-slate-600'}`}
        >
          {formatAmount(node.balance)}
        </TableCell>
      </TableRow>
      {expanded &&
        node.children?.map((child) => (
          <BalanceSheetTreeRow
            key={child.accountId}
            node={child}
            depth={depth + 1}
            formatAmount={formatAmount}
          />
        ))}
    </>
  );
}

export default function BalanceSheetTab() {
  const t = useTranslations('accounting.reports');
  const tTab = useTranslations('accounting.reports.balance-sheet');

  const searchParams = useSearchParams();
  const asOf = searchParams.get('asOf') || undefined;

  // Default is flat=false (tree mode)
  const { data: balanceData, isLoading } = useGetBalanceSheet({ asOf });

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  // Support both tree and flat modes
  const isTreeMode = !balanceData?.flat;
  const assets = isTreeMode ? balanceData?.assetTree || [] : balanceData?.assets || [];
  const liabilities = isTreeMode
    ? balanceData?.liabilityTree || []
    : balanceData?.liabilities || [];
  const equity = isTreeMode ? balanceData?.equityTree || [] : balanceData?.equity || [];

  const getExportRows = useCallback(
    () => buildBalanceSheetExportRows(balanceData, tTab),
    [balanceData, tTab],
  );

  const { exportData, isExporting } = useExportRows({
    columns: balanceSheetExportColumns(tTab),
    getRows: getExportRows,
    fileName: 'balance-sheet',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start border-b border-dashed pb-4 mb-4 flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{t('tabs.balance-sheet')}</h2>
          <p className="text-muted-foreground">{tTab('subtitle')}</p>
        </div>
        <ExportButton
          onExport={exportData}
          isExporting={isExporting}
          label={t('export-data')}
          variant="default"
          className="bg-[#118A7E] hover:bg-[#118A7E]/90 text-white"
        />
      </div>

      {!isLoading && balanceData && !balanceData.isBalanced && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{tTab('unbalanced')}</span>
            <span className="text-sm mt-1">{tTab('unbalanced-difference')}</span>
          </div>
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
      )}

      <AsOfDatePicker />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">
          <div className="bg-[#118A7E] text-white font-bold p-4 text-center text-lg">
            {tTab('assets')}
          </div>
          <div className="p-4 flex-1">
            <Table>
              <TableBody>
                {isTreeMode
                  ? (assets as IBalanceSheetTreeNode[]).map((node) => (
                      <BalanceSheetTreeRow
                        key={node.accountId}
                        node={node}
                        formatAmount={formatAmount}
                      />
                    ))
                  : (assets as IBalanceSheetLine[]).map((asset) => (
                      <TableRow
                        key={asset.accountCode}
                        className="hover:bg-slate-50/50 h-12 border-none"
                      >
                        <TableCell className="font-semibold text-slate-700">
                          {asset.accountName}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium w-32">
                          {formatAmount(asset.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                {assets.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                      لا توجد بيانات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="bg-slate-50 p-5 border-t-2 border-[#118A7E]/20 flex justify-between font-bold mt-auto">
            <span className="text-slate-800 text-lg">{tTab('total-assets')}</span>
            <span className="text-[#118A7E] text-xl font-mono">
              {balanceData ? formatAmount(balanceData.totalAssets) : '0.00'}
            </span>
          </div>
        </div>

        {/* Liabilities & Equity Section */}
        <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col">
          <div className="bg-[#118A7E] text-white font-bold p-4 text-center text-lg">
            {tTab('liabilities-and-equity')}
          </div>
          <div className="p-4 flex-1">
            <h4 className="font-bold text-slate-800 mb-4 px-3 py-1 border-r-4 border-[#368baf] bg-slate-50/50 rounded-sm">
              {tTab('liabilities')}
            </h4>
            <Table className="mb-4">
              <TableBody>
                {isTreeMode
                  ? (liabilities as IBalanceSheetTreeNode[]).map((node) => (
                      <BalanceSheetTreeRow
                        key={node.accountId}
                        node={node}
                        formatAmount={formatAmount}
                      />
                    ))
                  : (liabilities as IBalanceSheetLine[]).map((liability) => (
                      <TableRow
                        key={liability.accountCode}
                        className="hover:bg-slate-50/50 h-12 border-none"
                      >
                        <TableCell className="font-semibold text-slate-700">
                          {liability.accountName}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium w-32">
                          {formatAmount(liability.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                {liabilities.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-2 text-sm"
                    >
                      لا توجد التزامات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <h4 className="font-bold text-slate-800 mb-4 mt-6 px-3 py-1 border-r-4 border-[#118A7E] bg-slate-50/50 rounded-sm">
              {tTab('equity')}
            </h4>
            <Table>
              <TableBody>
                {isTreeMode
                  ? (equity as IBalanceSheetTreeNode[]).map((node) => (
                      <BalanceSheetTreeRow
                        key={node.accountId}
                        node={node}
                        formatAmount={formatAmount}
                      />
                    ))
                  : (equity as IBalanceSheetLine[]).map((eq) => (
                      <TableRow
                        key={eq.accountCode}
                        className="hover:bg-slate-50/50 h-12 border-none"
                      >
                        <TableCell className="font-semibold text-slate-700">
                          {eq.accountName}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium w-32">
                          {formatAmount(eq.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                {equity.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-2 text-sm"
                    >
                      لا توجد حقوق ملكية
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="bg-slate-50 p-5 border-t-2 border-[#368baf]/20 flex justify-between font-bold mt-auto">
            <span className="text-slate-800 text-lg">{tTab('total-liabilities-equity')}</span>
            <span className="text-[#368baf] text-xl font-mono">
              {balanceData
                ? formatAmount(balanceData.totalLiabilities + balanceData.totalEquity)
                : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
