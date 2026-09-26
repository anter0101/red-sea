import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IDriverAssistantTableRow } from './api/get-all';

export function driverAssistantsExportColumns(
  tStatus: (key: string) => string,
): ExportColumnDef<IDriverAssistantTableRow>[] {
  return createExportColumns<IDriverAssistantTableRow>([
    { key: 'assistantCode', header: 'كود التابع' },
    { key: 'assistantName', header: 'اسم التابع' },
    {
      key: 'status',
      header: 'الحالة',
      format: (value) =>
        value && value !== EMPTY_DISPLAY ? tStatus(String(value)) : String(value ?? EMPTY_DISPLAY),
    },
    { key: 'currentTrip', header: 'الرحلة التالية' },
    { key: 'carCode', header: 'كود السيارة' },
    { key: 'addedBy', header: 'أضيف بواسطة' },
    { key: 'salary', header: 'الراتب' },
  ]);
}

export { mapDriverAssistantRow } from './api/get-all';
