import { createExportColumns } from '@/lib/export';
import type { ExportColumnDef } from '@/lib/export';

import type { ICustodyTableRow } from './types';

export function custodyExportColumns(
  t: (key: string) => string,
): ExportColumnDef<ICustodyTableRow>[] {
  return createExportColumns<ICustodyTableRow>([
    { key: 'employeeName', header: t('table.employee') },
    { key: 'accountName', header: t('table.account') },
    { key: 'custodyAmount', header: t('table.custodyAmount') },
    { key: 'journeyNumber', header: t('table.journey') },
    { key: 'driverName', header: t('table.driver') },
    { key: 'driverLicense', header: t('table.driverLicense') },
    { key: 'driverAssistantName', header: t('table.driverAssistant') },
    { key: 'carPlate', header: t('table.car') },
    { key: 'trailerPlate', header: t('table.trailer') },
    {
      key: 'status',
      header: t('table.status'),
      format: (value) => (value ? t(`statuses.${String(value)}`) : ''),
    },
    { key: 'createdAt', header: t('table.createdAt') },
  ]);
}

export { toCustodyRow } from './api/get-all';
