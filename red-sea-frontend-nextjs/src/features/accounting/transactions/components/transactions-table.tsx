'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { ITransactionTableRow } from '../api/get-all';
import type { TransactionStatus } from '../enums';

const STATUS_COLORS: Record<TransactionStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent',
  POSTED: 'bg-badge-active-bg text-badge-active-fg hover:opacity-95 border-transparent',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200 border-transparent',
};

interface TransactionsTableProps {
  data: ITransactionTableRow[];
  onEdit?: (id: number) => void;
}

export default function TransactionsTable({ data, onEdit }: TransactionsTableProps) {
  const t = useTranslations('accounting.transactions');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.code')}</TableHead>
          <TableHead>{t('table.date')}</TableHead>
          <TableHead>{t('table.description')}</TableHead>

          <TableHead className="w-32 text-center">{t('table.status')}</TableHead>
          <TableHead className="text-left">{t('table.actions')}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              {t('list.no-data')}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-foreground">{item.code}</TableCell>
              <TableCell className="whitespace-nowrap text-foreground">{item.date}</TableCell>
              <TableCell
                className="max-w-[200px] truncate text-foreground"
                title={item.description}
              >
                {item.description}
              </TableCell>

              <TableCell className="text-center">
                <Badge
                  className={`px-4 py-1 rounded-full whitespace-nowrap text-xs font-semibold ${STATUS_COLORS[item.status]}`}
                >
                  {t(`statuses.${item.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  {item.status === 'DRAFT' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-action-icon hover:bg-muted hover:text-action-icon"
                      title={t('table.edit-draft')}
                      onClick={() => onEdit?.(item.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="inline-flex h-8 w-8" aria-hidden />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
