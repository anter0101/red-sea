import { FieldMap } from '@/utils/generic-field-mapper';
import { IInfo } from '../types';

export const logisticsInfoFields: FieldMap<IInfo>[] = [
  { label: 'محافظة التسليم', getValue: (i) => i.policyinfo.deliveryGov },
  { label: 'موقع التسليم', getValue: (i) => i.policyinfo.deliveryArea },
  { label: 'مفوض الاستلام', getValue: (i) => i.policyinfo.receivingDelegate },
  { label: 'كمية (طن)', getValue: (i) => i.policyinfo.quantity },
  { label: 'مسافة الرحلة (كم)', getValue: (i) => i.policyinfo.tripDistance },
  { label: 'الوزن الدفتري', getValue: (i) => i.policyinfo.bookWeight },
  { label: 'الوزن الفعلي', getValue: (i) => i.policyinfo.actualWeight },
  { label: 'وزن التسليم', getValue: (i) => i.policyinfo.deliveryWeight },
  { label: 'عجز الكمية', getValue: (i) => i.policyinfo.deliveryShortage },
  { label: 'آ. ت. ص.', getValue: (i) => i.policyinfo.ats },
  { label: 'إجمالي الايراد', getValue: (i) => i.policyinfo.revenue },
];
