'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { ITransactionLineTableRow } from '../api/get-all';
import type { EntryType } from '../enums';

const ENTRY_TYPE_COLORS: Record<EntryType, string> = {
  DEBIT: 'bg-red-500 hover:bg-red-600',
  CREDIT: 'bg-emerald-500 hover:bg-emerald-600',
};

interface TransactionLinesTableProps {
  data: ITransactionLineTableRow[];
}

export default function TransactionLinesTable({ data }: TransactionLinesTableProps) {
  const t = useTranslations('accounting.transaction-lines');

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.id')}</TableHead>
          <TableHead>{t('table.transaction')}</TableHead>
          <TableHead>{t('table.account')}</TableHead>
          <TableHead>{t('table.entry-type')}</TableHead>
          <TableHead>{t('table.amount')}</TableHead>
          <TableHead>{t('table.description')}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              {t('list.no-data')}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">#{item.id}</TableCell>
              <TableCell>{item.transactionCode}</TableCell>
              <TableCell>
                {item.accountCode} - {item.accountName}
              </TableCell>
              <TableCell>
                <Badge className={`${ENTRY_TYPE_COLORS[item.entryType]} text-white`}>
                  {t(`entry-types.${item.entryType}`)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{formatAmount(item.amount)}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={item.description}>
                {item.description}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
