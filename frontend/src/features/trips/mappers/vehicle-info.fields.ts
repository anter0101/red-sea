import { FieldMap } from '@/utils/generic-field-mapper';
import { IVehicle } from '../types';

export const vehicleFields: FieldMap<IVehicle>[] = [
  { label: 'رقم اللوحة', getValue: (v) => v.car?.plate ?? '' },
  { label: 'رقم الرخصة', getValue: (v) => v.car?.licenseNumber ?? '' },
  { label: 'نوع السيارة', getValue: (v) => v.car?.manufacturer ?? '' },
  { label: 'موديل السيارة', getValue: (v) => v.car?.model ?? '' },
  { label: 'سنة الصنع', getValue: (v) => v.car?.manufactureYear ?? '' },
  { label: 'لون السيارة', getValue: (v) => v.car?.color ?? '' },
  { label: 'عدد السلندرات', getValue: (v) => v.car?.cylinders ?? '' },
  { label: 'عدد المحاور', getValue: (v) => v.car?.axleCount ?? '' },
  { label: 'عدد لترات السولار', getValue: (v) => v.journey?.fuelLiters ?? 0 },
  {
    label: 'معدل استهلاك الوقود لكل 1000 كم',
    getValue: (v) => v.car?.fuelConsumptionPer1000km ?? 0,
  },
  { label: 'رقم لوحة المقطورة', getValue: (v) => v.trailer?.plate ?? '' },
  { label: 'رقم رخصة المقطورة', getValue: (v) => v.trailer?.licenseNumber ?? '' },
  { label: 'عدد محاور المقطورة', getValue: (v) => v.trailer?.axleCount ?? '' },
];
