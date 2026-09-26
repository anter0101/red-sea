import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IOfficeRequestTableRow } from './types';

export function officeRequestsExportColumns(
  t: (key: string) => string,
): ExportColumnDef<IOfficeRequestTableRow>[] {
  return createExportColumns<IOfficeRequestTableRow>([
    {
      key: 'type',
      header: t('table.type'),
      format: (value) => (value ? t(`types.${String(value)}`) : ''),
    },
    { key: 'journeyNumber', header: t('table.journey') },
    { key: 'amount', header: t('table.amount') },
    { key: 'fromName', header: t('table.from') },
    { key: 'toName', header: t('table.to') },
    {
      key: 'status',
      header: t('table.status'),
      format: (value) => (value ? t(`statuses.${String(value)}`) : ''),
    },
    { key: 'createdAt', header: t('table.createdAt') },
  ]);
}

export { toOfficeRequestRow } from './api/get-all';
