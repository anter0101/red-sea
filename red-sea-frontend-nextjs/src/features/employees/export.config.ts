import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IEmployeeTableRow } from './types';

export function employeesExportColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
): ExportColumnDef<IEmployeeTableRow>[] {
  return createExportColumns<IEmployeeTableRow>([
    { key: 'name', header: t('table.employee') },
    {
      key: 'role',
      header: t('table.role'),
      format: (value) => (value ? t(`roles.${String(value)}`) : '—'),
    },
    { key: 'custody', header: t('table.custody') },
    { key: 'lastSeen', header: t('table.last-seen') },
    {
      key: 'status',
      header: t('table.status'),
      format: (value) => (value ? tCommon(`statuses.${String(value)}`) : '—'),
    },
    { key: 'salary', header: t('table.salary') },
    {
      key: 'salaryType',
      header: t('table.salary-type'),
      format: (value) => (value ? t(`salary-types.${String(value)}`) : '—'),
    },
    { key: 'joinDate', header: t('table.join-date') },
  ]);
}

export { mapEmployeeRow } from './api/get-all';
