import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { ITransactionLineResponse as IDetailTransactionLine } from '../transactions/api/get-all';
import type { ITransactionLineTableRow } from './api/get-all';
import { EntryType } from './enums';

export function mapTransactionDetailLineRow(
  line: IDetailTransactionLine,
  transactionCode: string,
): ITransactionLineTableRow {
  return {
    id: line.id,
    transactionCode,
    accountName: line.account?.name || '—',
    accountCode: line.account?.code || '—',
    entryType: line.entryType as EntryType,
    amount: Number(line.amount),
    description: line.description || '—',
  };
}

export function transactionLinesExportColumns(
  t: (key: string) => string,
): ExportColumnDef<ITransactionLineTableRow>[] {
  return createExportColumns<ITransactionLineTableRow>([
    { key: 'id', header: t('table.id') },
    { key: 'transactionCode', header: t('table.transaction') },
    {
      key: 'accountCode',
      header: t('table.account'),
      format: (_value, row) => `${row.accountCode} - ${row.accountName}`,
    },
    {
      key: 'entryType',
      header: t('table.entry-type'),
      format: (value) => (value ? t(`entry-types.${String(value)}`) : '—'),
    },
    {
      key: 'amount',
      header: t('table.amount'),
      format: (value) =>
        new Intl.NumberFormat('en-EG', {
          style: 'currency',
          currency: 'EGP',
          minimumFractionDigits: 2,
        }).format(Number(value)),
    },
    { key: 'description', header: t('table.description') },
  ]);
}

export { mapTransactionLineRow } from './api/get-all';
