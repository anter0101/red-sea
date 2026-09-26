import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IDeviceTableRow } from './api/get-all-devices';

export function gpsDevicesExportColumns(): ExportColumnDef<IDeviceTableRow>[] {
  return createExportColumns<IDeviceTableRow>([
    { key: 'name', header: 'اسم الجهاز' },
    { key: 'imei', header: 'IMEI' },
    { key: 'speed', header: 'السرعة' },
    { key: 'location', header: 'الموقع' },
    { key: 'engineStatus', header: 'حالة المحرك' },
    { key: 'signalStrength', header: 'الإشارة' },
    { key: 'batteryLevel', header: 'البطارية' },
    { key: 'lastUpdate', header: 'آخر تحديث' },
    { key: 'carLicense', header: 'السيارة' },
  ]);
}

export { mapDeviceRow } from './api/get-all-devices';
