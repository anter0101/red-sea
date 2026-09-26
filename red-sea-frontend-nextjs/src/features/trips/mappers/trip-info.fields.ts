import { FieldMap } from '@/utils/generic-field-mapper';
import { PackingType, packingTypeLabels } from '@/features/clients/enums/packing-type';
import { IInfo } from '../types';

export const tripInfoFields: FieldMap<IInfo>[] = [
  { label: 'رقم التفويض', getValue: (i) => i.journeyinfo.delegateNumber },
  { label: 'رقم فاتورة الكترونية', getValue: (i) => i.journeyinfo.eInvoiceNo },
  { label: 'رقم ارشيف المستندات', getValue: (i) => i.journeyinfo.archiveNo },
  { label: 'موظف المكتب', getValue: (i) => i.journeyinfo.officeEmployee?.name },
  { label: 'إجمالي التكلفة', getValue: (i) => i.journeyinfo.totalCost },
  { label: 'الإيراد المتوقع', getValue: (i) => i.journeyinfo.expectedRevenue },
  { label: 'الإيراد الفعلي', getValue: (i) => i.journeyinfo.actualRevenue },
  { label: 'ض. ق. م.', getValue: (i) => i.journeyinfo.dqm },
  { label: 'إجمالي الربح', getValue: (i) => i.journeyinfo.totalProfit },
  { label: 'الاتجاه', getValue: (i) => i.journeyinfo.direction },
  { label: 'درجة الاسمنت', getValue: (i) => i.journeyinfo.cementGrade },
  {
    label: 'نوع التعبئة',
    getValue: (i) => {
      const packingType = i.journeyinfo.packingType;
      if (!packingType) return '';
      return packingTypeLabels[packingType as PackingType] ?? packingType;
    },
  },
];
