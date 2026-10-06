'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronLeft } from 'lucide-react';
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
import TableFilters from '@/components/common/table-filters';
import { useExportRows } from '@/hooks/use-export-rows';

import {
  useGetIncomeStatement,
  type IIncomeStatementLine,
  type IIncomeStatementTreeNode,
} from '../../../reports/api';
import {
  buildIncomeStatementExportRows,
  incomeStatementExportColumns,
} from '../../../reports/export.helpers';

function IncomeTreeRow({
  node,
  depth = 0,
  formatAmount,
  colorClass,
}: {
  node: IIncomeStatementTreeNode;
  depth?: number;
  formatAmount: (n: number) => string;
  colorClass: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isParent = hasChildren;

  return (
    <>
      <TableRow
        className={`hover:bg-slate-50/50 transition-colors h-14 ${isParent ? 'bg-slate-50/80 cursor-pointer' : ''}`}
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
          className={`w-48 font-medium ${isParent ? `font-bold ${colorClass}` : 'text-slate-600'}`}
        >
          {formatAmount(node.amount)}
        </TableCell>
      </TableRow>
      {expanded &&
        node.children?.map((child) => (
          <IncomeTreeRow
            key={child.accountId}
            node={child}
            depth={depth + 1}
            formatAmount={formatAmount}
            colorClass={colorClass}
          />
        ))}
    </>
  );
}

export default function IncomeStatementTab() {
  const t = useTranslations('accounting.reports');
  const tTab = useTranslations('accounting.reports.income-statement');

  const searchParams = useSearchParams();
  const dateFrom = searchParams.get('createdAtFrom') || undefined;
  const dateTo = searchParams.get('createdAtTo') || undefined;

  // Default is flat=false (tree mode)
  const { data: incomeData, isLoading } = useGetIncomeStatement({ dateFrom, dateTo });
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  // Support both tree and flat modes
  const isTreeMode = !incomeData?.flat;
  const revenues = isTreeMode ? incomeData?.revenueTree || [] : incomeData?.revenues || [];
  const expenses = isTreeMode ? incomeData?.expenseTree || [] : incomeData?.expenses || [];

  const getExportRows = useCallback(
    () => buildIncomeStatementExportRows(incomeData, tTab),
    [incomeData, tTab],
  );

  const { exportData, isExporting } = useExportRows({
    columns: incomeStatementExportColumns(tTab),
    getRows: getExportRows,
    fileName: 'income-statement',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 items-start border-b border-dashed pb-4 mb-4 flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{t('tabs.income-statement')}</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Income (Left) */}
        <div className="bg-[#368baf] text-white p-6 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.1)] flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
          <span className="text-sm font-medium mb-1">{tTab('net-income')}</span>
          <span className="text-3xl font-bold">
            {incomeData?.netIncome != null
              ? `${incomeData.netIncome >= 0 ? '+' : ''}${formatAmount(incomeData.netIncome)}`
              : '0.00'}
          </span>
        </div>

        {/* Total Expenses (Middle) */}
        <div className="bg-[#d64545] text-white p-6 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.1)] flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
          <span className="text-sm font-medium mb-1">{tTab('total-expenses')}</span>
          <span className="text-3xl font-bold">
            {incomeData?.totalExpenses ? formatAmount(incomeData.totalExpenses) : '0.00'}
          </span>
        </div>

        {/* Total Revenue (Right) */}
        <div className="bg-[#118A7E] text-white p-6 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.1)] flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
          <span className="text-sm font-medium mb-1">{tTab('total-revenue')}</span>
          <span className="text-3xl font-bold">
            {incomeData?.totalRevenue ? formatAmount(incomeData.totalRevenue) : '0.00'}
          </span>
        </div>
      </div>

      <TableFilters showSearch={false} applyDefaultDateRange={true} />

      <div className="bg-white border rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="font-bold text-white bg-[#118A7E] h-12 text-lg"
                  colSpan={2}
                >
                  {tTab('revenue')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} className="p-0">
                  <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar">
                    <Table className="w-full">
                      <TableBody>
                        {isTreeMode
                          ? (revenues as IIncomeStatementTreeNode[]).map((node) => (
                              <IncomeTreeRow
                                key={node.accountId}
                                node={node}
                                formatAmount={formatAmount}
                                colorClass="text-[#118A7E]"
                              />
                            ))
                          : (revenues as IIncomeStatementLine[]).map((account) => (
                              <TableRow
                                key={account.accountCode}
                                className="hover:bg-slate-50/50 transition-colors h-14"
                              >
                                <TableCell className="font-semibold text-slate-800">
                                  {account.accountName}
                                </TableCell>
                                <TableCell className="text-slate-600 w-48 font-medium">
                                  {formatAmount(account.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                        {revenues.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-4 text-muted-foreground"
                            >
                              لا توجد إيرادات
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#118A7E]/5 hover:bg-[#118A7E]/10 border-b-2 border-[#118A7E]/20">
                <TableCell className="font-bold text-slate-800 py-4">
                  {tTab('total-revenue')}
                </TableCell>
                <TableCell className="font-bold text-[#118A7E] text-lg font-mono">
                  {incomeData?.totalRevenue ? formatAmount(incomeData.totalRevenue) : '0.00'}
                </TableCell>
              </TableRow>
            </TableBody>

            <TableHeader className="bg-slate-50 border-b border-t">
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="font-bold text-white bg-[#d64545] h-12 text-lg"
                  colSpan={2}
                >
                  {tTab('expenses')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} className="p-0">
                  <div className="max-h-[400px] overflow-y-auto w-full custom-scrollbar">
                    <Table className="w-full">
                      <TableBody>
                        {isTreeMode
                          ? (expenses as IIncomeStatementTreeNode[]).map((node) => (
                              <IncomeTreeRow
                                key={node.accountId}
                                node={node}
                                formatAmount={formatAmount}
                                colorClass="text-[#d64545]"
                              />
                            ))
                          : (expenses as IIncomeStatementLine[]).map((account) => (
                              <TableRow
                                key={account.accountCode}
                                className="hover:bg-slate-50/50 transition-colors h-14"
                              >
                                <TableCell className="font-semibold text-slate-800">
                                  {account.accountName}
                                </TableCell>
                                <TableCell className="text-slate-600 w-48 font-medium">
                                  ({formatAmount(account.amount)})
                                </TableCell>
                              </TableRow>
                            ))}
                        {expenses.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-4 text-muted-foreground"
                            >
                              لا توجد مصروفات
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#d64545]/10 hover:bg-[#d64545]/15 border-b-2 border-[#d64545]/20">
                <TableCell className="font-bold text-slate-800 py-4">
                  {tTab('total-expenses')}
                </TableCell>
                <TableCell className="font-bold text-[#d64545] text-lg font-mono">
                  ({incomeData?.totalExpenses ? formatAmount(incomeData.totalExpenses) : '0.00'})
                </TableCell>
              </TableRow>

              <TableRow className="bg-[#368baf] hover:bg-[#368baf] border-none">
                <TableCell className="font-bold text-white text-lg">{tTab('net-income')}</TableCell>
                <TableCell className="font-bold text-white text-lg">
                  {incomeData?.netIncome != null
                    ? `${incomeData.netIncome >= 0 ? '+' : ''}${formatAmount(incomeData.netIncome)}`
                    : '0.00'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
