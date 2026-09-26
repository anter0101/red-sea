'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { IAccountTableRow } from '../api/get-all';
import AccountTreeRow from './account-tree-row';

interface AccountsTableProps {
  data: IAccountTableRow[];
  onEdit?: (id: number, account?: IAccountTableRow) => void;
  onDelete?: (id: number) => void;
}

export default function AccountsTable({ data, onEdit, onDelete }: AccountsTableProps) {
  const t = useTranslations('accounting.accounts');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-[400px] flex-1 flex-col overflow-hidden rounded-xl bg-card shadow-sm [&_div[data-slot=table-container]]:flex-1 [&_div[data-slot=table-container]]:overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur shadow-sm">
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-14 text-center font-semibold text-xs text-muted-foreground">
              {t('table.expand')}
            </TableHead>
            <TableHead className="font-semibold">{t('table.code')}</TableHead>
            <TableHead className="font-semibold">{t('table.name')}</TableHead>
            <TableHead className="font-semibold">{t('table.type')}</TableHead>
            <TableHead className="font-semibold">{t('table.normal-balance')}</TableHead>
            <TableHead className="font-semibold">{t('table.opening-balance')}</TableHead>
            <TableHead className="font-semibold">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                {t('list.no-data')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <AccountTreeRow
                key={item.id}
                account={item}
                depth={0}
                expandedIds={expandedRows}
                onToggleExpand={toggleRow}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
