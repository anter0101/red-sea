import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { ITrailerTableRow } from './api/get-all';

export function trailersExportColumns(
  tStatus: (key: string) => string,
  tOwnership: (key: string) => string,
): ExportColumnDef<ITrailerTableRow>[] {
  return createExportColumns<ITrailerTableRow>([
    { key: 'code', header: 'كود المقطورة' },
    { key: 'plateNumber', header: 'رقم اللوحة' },
    { key: 'plateLetters', header: 'الحروف' },
    {
      key: 'ownerShip',
      header: 'الملكية',
      format: (value) =>
        value && value !== EMPTY_DISPLAY
          ? tOwnership(String(value))
          : String(value ?? EMPTY_DISPLAY),
    },
    {
      key: 'status',
      header: 'الحالة',
      format: (value) =>
        value && value !== EMPTY_DISPLAY ? tStatus(String(value)) : String(value ?? EMPTY_DISPLAY),
    },
    { key: 'licenseNumber', header: 'رقم الرخصة' },
    { key: 'licenseExpiryDate', header: 'تاريخ انتهاء الرخصة' },
    { key: 'createdBy', header: 'أضيف بواسطة' },
  ]);
}

export { mapTrailerRow } from './api/get-all';
