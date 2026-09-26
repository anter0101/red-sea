import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { ICarTableRow } from './api/get-all';

export function carsExportColumns(
  tStatus: (key: string) => string,
  tColors: (key: string) => string,
  tTon: (key: string) => string,
  maxWeightHeader: string,
): ExportColumnDef<ICarTableRow>[] {
  return createExportColumns<ICarTableRow>([
    { key: 'carCode', header: 'الكود' },
    { key: 'manufacturer', header: 'المصنّع' },
    { key: 'model', header: 'الموديل' },
    { key: 'year', header: 'السنة' },
    {
      key: 'status',
      header: 'الحالة',
      format: (value) =>
        value && value !== EMPTY_DISPLAY ? tStatus(String(value)) : String(value ?? EMPTY_DISPLAY),
    },
    {
      key: 'color',
      header: 'اللون',
      format: (value) =>
        value && value !== EMPTY_DISPLAY ? tColors(String(value)) : String(value ?? EMPTY_DISPLAY),
    },
    { key: 'axleCount', header: 'عدد المحاور' },
    {
      key: 'maxWeight',
      header: maxWeightHeader,
      format: (value) =>
        value && value !== EMPTY_DISPLAY
          ? `${value} ${tTon('ton')}`
          : String(value ?? EMPTY_DISPLAY),
    },
    { key: 'plateNumber', header: 'رقم اللوحة' },
    { key: 'plateLetters', header: 'الحروف' },
    { key: 'chassis', header: 'الشاسيه' },
    { key: 'ownership', header: 'الملكية' },
    { key: 'license', header: 'الرخصة' },
    { key: 'licenseExpiry', header: 'تاريخ الانتهاء' },
    { key: 'addedBy', header: 'اضيف بواسطة' },
  ]);
}

export { mapCarRow } from './api/get-all';
