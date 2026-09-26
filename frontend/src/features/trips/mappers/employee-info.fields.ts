import { FieldMap } from '@/utils/generic-field-mapper';
import { IEmployee } from '../types';

export const employeeFields: FieldMap<IEmployee>[] = [
  { label: 'كود السائق', getValue: (e) => e.driver?.code ?? '' },
  { label: 'اسم السائق', getValue: (e) => e.driver?.fullName?.trim() ?? '' },
  { label: 'رقم هاتف السائق', getValue: (e) => e.driver?.contacts?.[0]?.value ?? '' },
  { label: 'رقم البطاقة الشخصية للسائق', getValue: (e) => e.driver?.personalId ?? '' },
  {
    label: 'تاريخ انتهاء البطاقة الشخصية للسائق',
    getValue: (e) => e.driver?.personalIdExpiry ?? '',
  },
  { label: 'كود التابع', getValue: (e) => e.assistant?.code ?? '' },
  { label: 'اسم التابع', getValue: (e) => e.assistant?.fullName?.trim() ?? '' },
  { label: 'رقم الهاتف التابع', getValue: (e) => e.assistant?.contacts?.[0]?.value ?? '' },
  { label: 'رقم البطاقة الشخصية للتابع', getValue: (e) => e.assistant?.personalId ?? '' },
  {
    label: 'تاريخ انتهاء البطاقة الشخصية للتابع',
    getValue: (e) => e.assistant?.personalIdExpiry ?? '',
  },
];
