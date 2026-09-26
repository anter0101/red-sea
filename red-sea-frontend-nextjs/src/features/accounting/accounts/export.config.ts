import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IAccountTableRow } from './api/get-all';

export function accountsExportColumns(
  t: (key: string) => string,
): ExportColumnDef<IAccountTableRow>[] {
  return createExportColumns<IAccountTableRow>([
    { key: 'code', header: t('table.code') },
    { key: 'name', header: t('table.name') },
    {
      key: 'type',
      header: t('table.type'),
      format: (value) => (value ? t(`types.${String(value)}`) : ''),
    },
    {
      key: 'normalBalance',
      header: t('table.normal-balance'),
      format: (value) => (value ? t(`normal-balances.${String(value)}`) : ''),
    },
    {
      key: 'openingBalance',
      header: t('table.opening-balance'),
      format: (value) => (value != null ? String(value) : '—'),
    },
  ]);
}

export { mapAccountRow } from './api/get-all';
