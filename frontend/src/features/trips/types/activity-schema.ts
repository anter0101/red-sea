import { z } from 'zod';

export const tripPolicySchema = z.object({
  journeyId: z.number().optional(), // رحلة الرحلة
  deliveryGovId: z.string().optional(),
  deliveryAreaId: z.string().optional(), // موقع التسليم
  employeeId: z.string().optional(), // مفوض الاستلام
  policyNo: z.string().optional(), // رقم البوليصة
  policyDate: z.string().optional(), // تاريخ البوليصة
  loadingPermitNo: z.string().optional(), // رقم اذن التحميل
  loadingDate: z.string().optional(), // تاريخ التحميل
  bookWeight: z.coerce.number().min(0).optional(), // الوزن الدفتري
  actualWeight: z.coerce.number().min(0).optional(), // الوزن الفعلي
  deliveryWeight: z.coerce.number().min(0).optional(), // وزن التسليم
  shortageQty: z.coerce.number().min(0).optional(), // عجز الكمية
  entryTimeFactory: z.string().optional(), // وقت دخول المصنع
  exitTimeFactory: z.string().optional(), // وقت الخروج من المصنع
  archiveNo: z.string().optional(), // رقم ارشيف المستندات
  tripDate: z.string().optional(), // تاريخ الرحلة
  tripDistance: z.coerce.number().min(0).optional(), // مسافة الرحلة
  policyFile: z.string().optional(), // ملف البوليصة
  transportSupplierId: z.string().optional(),
});

export type TripPolicyFormValues = z.infer<typeof tripPolicySchema>;
