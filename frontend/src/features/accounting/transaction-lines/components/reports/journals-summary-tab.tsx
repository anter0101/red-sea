'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import ExportButton from '@/components/common/export-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import TableFilters from '@/components/common/table-filters';
import { useExportRows } from '@/hooks/use-export-rows';
import { createExportColumns } from '@/lib/export/create-columns';

import {
  useGetAllTransactions,
  type ITransactionTableRow,
} from '../../../transactions/api/get-all';

type JournalSummaryRow = {
  type: string;
  count: number;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  date: string;
};

function journalsSummaryExportColumns(t: (key: string) => string) {
  return createExportColumns<JournalSummaryRow>([
    { key: 'type', header: t('journals-summary.type') },
    { key: 'count', header: t('journals-summary.transactions-count') },
    {
      key: 'totalDebit',
      header: t('journals-summary.total-debit'),
      format: (v) => String(v),
    },
    {
      key: 'totalCredit',
      header: t('journals-summary.total-credit'),
      format: (v) => String(v),
    },
    {
      key: 'netBalance',
      header: t('journals-summary.net-balance'),
      format: (v) => String(v),
    },
    { key: 'date', header: 'التاريخ' },
  ]);
}

export default function JournalsSummaryTab() {
  const t = useTranslations('accounting.reports');

  const { transactions, isGetTransactionsPending } = useGetAllTransactions({ pageSize: 1000 });

  const groupedJournals = useMemo(() => {
    const groups: Record<
      string,
      { type: string; count: number; totalDebit: number; totalCredit: number; date: string }
    > = {};

    transactions.forEach((tx: ITransactionTableRow) => {
      const groupKey = tx.status;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          type: groupKey,
          count: 0,
          totalDebit: 0,
          totalCredit: 0,
          date: tx.date,
        };
      }

      groups[groupKey].count += 1;
      groups[groupKey].totalDebit += tx.totalDebit;
      groups[groupKey].totalCredit += tx.totalCredit;
    });

    return Object.values(groups);
  }, [transactions]);

  const exportRows = useMemo<JournalSummaryRow[]>(
    () =>
      groupedJournals.map((journal) => ({
        type: journal.type,
        count: journal.count,
        totalDebit: journal.totalDebit,
        totalCredit: journal.totalCredit,
        netBalance: Math.abs(journal.totalDebit - journal.totalCredit),
        date: journal.date,
      })),
    [groupedJournals],
  );

  const getExportRows = useCallback(() => exportRows, [exportRows]);

  const { exportData, isExporting } = useExportRows({
    columns: journalsSummaryExportColumns(t),
    getRows: getExportRows,
    fileName: 'journals-summary',
  });

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-end">
        <ExportButton onExport={exportData} isExporting={isExporting} label={t('export-data')} />
      </div>
      <TableFilters applyDefaultDateRange={true} />

      <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden">
        {isGetTransactionsPending ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('tabs.journals-summary')}...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t('journals-summary.type')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t('journals-summary.transactions-count')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t('journals-summary.total-debit')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t('journals-summary.total-credit')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {t('journals-summary.net-balance')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedJournals.map((journal, i) => {
                const netBalance = Math.abs(journal.totalDebit - journal.totalCredit);
                // Cycle colors matching the UI screenshots
                const colors = [
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-secondary',
                  'bg-sky-500',
                  'bg-purple-500',
                  'bg-pink-500',
                ];
                const badgeColor = colors[i % colors.length];

                return (
                  <TableRow
                    key={journal.type}
                    className="hover:bg-slate-50/50 transition-colors h-14"
                  >
                    <TableCell className="text-center align-middle">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 flex items-center gap-2 h-14">
                      <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`}></span>
                      {journal.type}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatAmount(journal.count)}</TableCell>
                    <TableCell className="text-slate-600">
                      {formatAmount(journal.totalDebit)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatAmount(journal.totalCredit)}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatAmount(netBalance)}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{journal.date}</TableCell>
                  </TableRow>
                );
              })}
              {groupedJournals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
