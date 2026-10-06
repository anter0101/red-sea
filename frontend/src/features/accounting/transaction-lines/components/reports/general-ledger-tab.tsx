'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import ExportButton from '@/components/common/export-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllAccounts } from '../../../accounts/api/get-all';
import { useGetGeneralLedger } from '../../../reports/api';
import {
  generalLedgerExportColumns,
  parseGeneralLedgerResponse,
} from '../../../reports/export.helpers';

export default function GeneralLedgerTab() {
  const t = useTranslations('accounting.reports');
  const tTab = useTranslations('accounting.reports.general-ledger');

  const searchParams = useSearchParams();
  const dateFrom = searchParams.get('createdAtFrom') || undefined;
  const dateTo = searchParams.get('createdAtTo') || undefined;

  const { page, pageSize } = usePaginationParams();

  const { accounts, isGetAccountsPending } = useGetAllAccounts({ isLeaf: true, pageSize: 1000 });

  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id.toString());
    }
  }, [accounts, selectedAccountId]);

  const { data, isLoading } = useGetGeneralLedger({
    accountId: Number(selectedAccountId),
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  const ledgerExportParams = useMemo(
    () => ({
      accountId: Number(selectedAccountId),
      dateFrom,
      dateTo,
    }),
    [selectedAccountId, dateFrom, dateTo],
  );

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/accounting/reports/ledger',
    params: ledgerExportParams,
    columns: generalLedgerExportColumns(tTab),
    mapRow: (row) => row,
    fileName: 'general-ledger',
    enabled: !!selectedAccountId,
    parseResponse: parseGeneralLedgerResponse,
  });

  const ledgerData = data?.data;
  const totalCount = data?.totalCount || 0;
  const lines = ledgerData?.lines || [];
  const openingBalance = ledgerData?.openingBalance || 0;
  const periodClosingBalance = ledgerData?.periodClosingBalance || 0;
  const periodTotalDebits = ledgerData?.periodTotalDebits || 0;
  const periodTotalCredits = ledgerData?.periodTotalCredits || 0;
  // Net change = total debits - total credits for the period
  const netChange = periodTotalDebits - periodTotalCredits;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start border-b border-dashed pb-4 mb-4 flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{t('tabs.general-ledger')}</h2>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl bg-stat-card-1 p-6 text-white shadow-md">
          <span className="mb-1 text-sm font-medium">{tTab('net-change')}</span>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-white/80" />
            <span className="text-3xl font-bold">
              {netChange >= 0 ? '+' : ''}
              {formatAmount(netChange)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-stat-card-2 p-6 text-white shadow-md">
          <span className="mb-1 text-sm font-medium">{tTab('closing-balance')}</span>
          <span className="text-3xl font-bold">{formatAmount(periodClosingBalance)}</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-stat-card-3 p-6 text-white shadow-md">
          <span className="mb-1 text-sm font-medium">{tTab('opening-balance')}</span>
          <span className="text-3xl font-bold">{formatAmount(openingBalance)}</span>
        </div>
      </div>

      <TableFilters applyDefaultDateRange={true}>
        <div className="w-full sm:w-64">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            disabled={isGetAccountsPending}
          >
            <SelectTrigger className="h-10 bg-white">
              <SelectValue placeholder="اختر الحساب" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id.toString()}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableFilters>

      <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.date')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.reference')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.description')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.debit')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.credit')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {tTab('table.balance')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, idx) => {
                return (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors h-14">
                    <TableCell className="text-slate-600 font-medium">
                      {line.date || EMPTY_DISPLAY}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {line.transactionCode}
                    </TableCell>
                    <TableCell className="text-slate-600">{line.description}</TableCell>
                    <TableCell className="text-slate-600">
                      {line.debit > 0 ? formatAmount(line.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {line.credit > 0 ? formatAmount(line.credit) : '-'}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {formatAmount(line.balance)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {lines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {totalCount > 0 && <TablePagination totalCount={totalCount} />}
    </div>
  );
}
