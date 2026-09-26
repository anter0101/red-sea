import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

export type CarDetailTableRow = {
  id: string;
  carCode: string;
  carNumber: string;
  carType: string;
  model: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  color: string;
  maxLoad: string;
  ownershipType: string;
  partnersCount: string;
  driverName: string;
  trailerNumber: string;
  carStatus: string;
  addedBy: string;
};

export function carDetailTableExportColumns(): ExportColumnDef<CarDetailTableRow>[] {
  return createExportColumns<CarDetailTableRow>([
    { key: 'carCode', header: 'كود السيارة' },
    { key: 'carNumber', header: 'رقم السيارة' },
    { key: 'carType', header: 'نوع السيارة' },
    { key: 'model', header: 'موديل السيارة' },
    { key: 'licenseNumber', header: 'رقم الرخصة' },
    { key: 'licenseExpiryDate', header: 'تاريخ انتهاء الرخصة' },
    { key: 'color', header: 'لون السيارة' },
    { key: 'maxLoad', header: 'أقصى حمولة' },
    { key: 'ownershipType', header: 'نوع الملكية' },
    { key: 'partnersCount', header: 'عدد الشركاء' },
    { key: 'driverName', header: 'السائق الحالي' },
    { key: 'trailerNumber', header: 'رقم المقطورة' },
    { key: 'carStatus', header: 'الحالة' },
    { key: 'addedBy', header: 'أضيف بواسطة' },
  ]);
}
