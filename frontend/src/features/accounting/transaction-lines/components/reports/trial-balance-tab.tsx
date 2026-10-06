'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, ArrowUpRight, ChevronDown, ChevronLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import ExportButton from '@/components/common/export-button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableFilters from '@/components/common/table-filters';
import { useExportRows } from '@/hooks/use-export-rows';

import {
  useGetTrialBalance,
  type ITrialBalanceLine,
  type ITrialBalanceTreeNode,
} from '../../../reports/api';
import {
  flattenTrialBalanceTree,
  trialBalanceExportColumns,
} from '../../../reports/export.helpers';
import { Badge } from '@/components/ui/badge';

function TrialBalanceTreeRow({
  node,
  depth = 0,
  formatAmount,
  tTab,
}: {
  node: ITrialBalanceTreeNode;
  depth?: number;
  formatAmount: (n: number) => string;
  tTab: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isParent = hasChildren;

  return (
    <>
      <TableRow
        className={`hover:bg-slate-50/50 transition-colors ${isParent ? 'bg-slate-50/80 cursor-pointer' : ''} ${depth === 0 ? 'border-t-2 border-slate-200' : ''}`}
        onClick={hasChildren ? () => setExpanded(!expanded) : undefined}
      >
        <TableCell>
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
            <Badge
              variant="secondary"
              className={`font-mono ${isParent ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {node.accountCode}
            </Badge>
          </div>
        </TableCell>
        <TableCell
          className={`font-medium ${isParent ? 'font-bold text-slate-800' : 'text-slate-700'}`}
        >
          {node.accountName}
        </TableCell>
        {/* Opening Debit */}
        <TableCell className="text-[#118A7E] font-medium">
          {node.openingDebit > 0 ? formatAmount(node.openingDebit) : '-'}
        </TableCell>
        {/* Opening Credit */}
        <TableCell className="text-[#118A7E] font-medium">
          {node.openingCredit > 0 ? formatAmount(node.openingCredit) : '-'}
        </TableCell>
        {/* Period Debit */}
        <TableCell className="text-[#118A7E] font-medium">
          {node.totalDebit > 0 ? formatAmount(node.totalDebit) : '-'}
        </TableCell>
        {/* Period Credit */}
        <TableCell className="text-[#118A7E] font-medium">
          {node.totalCredit > 0 ? formatAmount(node.totalCredit) : '-'}
        </TableCell>
        {/* Closing Debit */}
        <TableCell className="text-blue-600 font-bold">
          {node.closingDebit > 0 ? formatAmount(node.closingDebit) : '-'}
        </TableCell>
        {/* Closing Credit */}
        <TableCell className="text-blue-600 font-bold">
          {node.closingCredit > 0 ? formatAmount(node.closingCredit) : '-'}
        </TableCell>
      </TableRow>
      {expanded &&
        node.children?.map((child) => (
          <TrialBalanceTreeRow
            key={child.accountId}
            node={child}
            depth={depth + 1}
            formatAmount={formatAmount}
            tTab={tTab}
          />
        ))}
    </>
  );
}

export default function TrialBalanceTab() {
  const t = useTranslations('accounting.reports');
  const tTab = useTranslations('accounting.reports.trial-balance');

  const searchParams = useSearchParams();
  const dateFrom = searchParams.get('createdAtFrom') || undefined;
  const dateTo = searchParams.get('createdAtTo') || undefined;

  // Default is flat=false (tree mode)
  const { data: trialData, isLoading } = useGetTrialBalance({ dateFrom, dateTo });

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const isBalanced = trialData?.isBalanced ?? true;
  const totalDebit = trialData?.grandTotalDebit || 0;
  const totalCredit = trialData?.grandTotalCredit || 0;
  const grandOpeningDebit = trialData?.grandOpeningDebit || 0;
  const grandOpeningCredit = trialData?.grandOpeningCredit || 0;
  const difference = Math.abs(totalDebit - totalCredit);

  // Support both tree and flat modes
  const treeNodes = trialData?.tree || [];
  const flatLines = trialData?.lines || [];
  const isTreeMode = !trialData?.flat;
  const hasData = isTreeMode ? treeNodes.length > 0 : flatLines.length > 0;

  const getExportRows = useCallback(() => {
    if (!trialData) return [];
    if (trialData.flat && trialData.lines) {
      return trialData.lines.map((line) => ({ ...line, accountName: line.accountName }));
    }
    if (trialData.tree) return flattenTrialBalanceTree(trialData.tree);
    return [];
  }, [trialData]);

  const { exportData, isExporting } = useExportRows({
    columns: trialBalanceExportColumns(tTab),
    getRows: getExportRows,
    fileName: 'trial-balance',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start border-b border-dashed pb-4 mb-4 flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{t('tabs.trial-balance')}</h2>
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
          <span className="mb-1 text-sm font-medium">{tTab('difference')}</span>
          <div className="flex items-center gap-2">
            {!isBalanced && <ArrowUpRight className="h-5 w-5 text-white/80" />}
            <span className="text-3xl font-bold">
              {!isBalanced ? '+' : ''}
              {formatAmount(difference)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-stat-card-2 p-6 text-white shadow-md">
          <span className="mb-1 text-sm font-medium">{tTab('total-credit')}</span>
          <span className="text-3xl font-bold">{formatAmount(totalCredit)}</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-stat-card-3 p-6 text-white shadow-md">
          <span className="mb-1 text-sm font-medium">{tTab('total-debit')}</span>
          <span className="text-3xl font-bold">{formatAmount(totalDebit)}</span>
        </div>
      </div>

      {!isBalanced && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="font-semibold">{tTab('unbalanced')}</span>
            <span className="text-sm">
              {tTab('unbalanced-difference')} {formatAmount(difference)}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
      )}

      {isBalanced && difference === 0 && hasData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 rounded-lg p-4 flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="font-semibold">{tTab('balanced')}</span>
            <span className="text-sm">{tTab('balanced-description')}</span>
          </div>
          <Badge variant="outline" className="text-blue-500 border-blue-200">
            متوازن
          </Badge>
        </div>
      )}

      <TableFilters showSearch={false} applyDefaultDateRange={true} />

      <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
        ) : (
          <Table>
            <TableHeader className="bg-[#118A7E]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead
                  colSpan={2}
                  className="text-center font-semibold text-white/90 border-l border-white/20"
                >
                  {/* Empty — Code & Name */}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center font-bold text-white border-l border-white/20"
                >
                  {tTab('table.opening-balance') || 'الرصيد الافتتاحي'}
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center font-bold text-white border-l border-white/20"
                >
                  {tTab('table.period-movement') || 'الحركة خلال الفترة'}
                </TableHead>
                <TableHead colSpan={2} className="text-center font-bold text-white">
                  {tTab('table.closing-balance') || 'الرصيد الختامي'}
                </TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent border-none bg-[#0e7a6f]">
                <TableHead className="font-semibold text-white/90">
                  {tTab('table.code')}
                </TableHead>
                <TableHead className="font-semibold text-white/90 whitespace-nowrap border-l border-white/20">
                  {tTab('table.account-name')}
                </TableHead>
                <TableHead className="font-semibold text-white/90">
                  {tTab('table.debit')}
                </TableHead>
                <TableHead className="font-semibold text-white/90 border-l border-white/20">
                  {tTab('table.credit')}
                </TableHead>
                <TableHead className="font-semibold text-white/90">
                  {tTab('table.debit')}
                </TableHead>
                <TableHead className="font-semibold text-white/90 border-l border-white/20">
                  {tTab('table.credit')}
                </TableHead>
                <TableHead className="font-semibold text-white/90">
                  {tTab('table.debit')}
                </TableHead>
                <TableHead className="font-semibold text-white/90">
                  {tTab('table.credit')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTreeMode
                ? treeNodes.map((node) => (
                    <TrialBalanceTreeRow
                      key={node.accountId}
                      node={node}
                      formatAmount={formatAmount}
                      tTab={tTab}
                    />
                  ))
                : flatLines.map((account: ITrialBalanceLine) => (
                    <TableRow
                      key={account.accountCode}
                      className="hover:bg-slate-50/50 transition-colors h-14"
                    >
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 font-mono"
                        >
                          {account.accountCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {account.accountName}
                      </TableCell>
                      <TableCell className="text-[#118A7E] font-medium">
                        {account.openingDebit > 0 ? formatAmount(account.openingDebit) : '-'}
                      </TableCell>
                      <TableCell className="text-[#118A7E] font-medium">
                        {account.openingCredit > 0 ? formatAmount(account.openingCredit) : '-'}
                      </TableCell>
                      <TableCell className="text-[#118A7E] font-medium">
                        {account.totalDebit > 0 ? formatAmount(account.totalDebit) : '-'}
                      </TableCell>
                      <TableCell className="text-[#118A7E] font-medium">
                        {account.totalCredit > 0 ? formatAmount(account.totalCredit) : '-'}
                      </TableCell>
                      <TableCell className="text-blue-600 font-bold">
                        {account.closingDebit > 0 ? formatAmount(account.closingDebit) : '-'}
                      </TableCell>
                      <TableCell className="text-blue-600 font-bold">
                        {account.closingCredit > 0 ? formatAmount(account.closingCredit) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              {!hasData && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground bg-slate-50/30"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">لا توجد بيانات متاحة حالياً</p>
                      <p className="text-sm">جرب تغيير نطاق التاريخ المختار</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {hasData && (
              <TableFooter className="bg-[#1e293b] text-white">
                <TableRow className="hover:bg-[#1e293b] h-16 border-none">
                  <TableCell colSpan={2} className="text-xl font-bold p-4">
                    <div className="flex items-center gap-3 justify-center">
                      {tTab('table.total')}
                      {!isBalanced && (
                        <Badge
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-500 text-xs px-2 py-0"
                        >
                          {tTab('unbalanced')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xl font-bold">
                    {formatAmount(grandOpeningDebit)}
                  </TableCell>
                  <TableCell className="text-xl font-bold">
                    {formatAmount(grandOpeningCredit)}
                  </TableCell>
                  <TableCell className="text-xl font-bold">{formatAmount(totalDebit)}</TableCell>
                  <TableCell className="text-xl font-bold">{formatAmount(totalCredit)}</TableCell>
                  <TableCell className="text-xl font-bold">
                    {formatAmount(
                      grandOpeningDebit + totalDebit - totalCredit > 0
                        ? grandOpeningDebit + totalDebit - totalCredit
                        : 0,
                    )}
                  </TableCell>
                  <TableCell className="text-xl font-bold">
                    {formatAmount(
                      grandOpeningCredit + totalCredit - totalDebit > 0
                        ? grandOpeningCredit + totalCredit - totalDebit
                        : 0,
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </div>
    </div>
  );
}
