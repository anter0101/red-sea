import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IDriverTableRow } from './api/get-all';

export function driversExportColumns(
  tStatus: (key: string) => string,
): ExportColumnDef<IDriverTableRow>[] {
  return createExportColumns<IDriverTableRow>([
    { key: 'driverCode', header: 'كود السائق' },
    { key: 'driverName', header: 'اسم السائق' },
    { key: 'license', header: 'الرخصة' },
    {
      key: 'status',
      header: 'الحالة',
      format: (value) =>
        value && value !== EMPTY_DISPLAY ? tStatus(String(value)) : String(value ?? EMPTY_DISPLAY),
    },
    { key: 'currentTrip', header: 'الرحلة الحالية' },
    { key: 'carCode', header: 'كود السيارة' },
    { key: 'addedBy', header: 'أضيف بواسطة' },
    { key: 'salary', header: 'الراتب' },
  ]);
}

export { mapDriverRow } from './api/get-all';
