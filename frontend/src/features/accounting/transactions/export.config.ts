import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { ITransactionTableRow } from './api/get-all';

export function transactionsExportColumns(
  t: (key: string) => string,
): ExportColumnDef<ITransactionTableRow>[] {
  return createExportColumns<ITransactionTableRow>([
    { key: 'code', header: t('table.code') },
    { key: 'date', header: t('table.date') },
    { key: 'description', header: t('table.description') },
    {
      key: 'status',
      header: t('table.status'),
      format: (value) => (value ? t(`statuses.${String(value)}`) : ''),
    },
  ]);
}

export { mapTransactionRow } from './api/get-all';
