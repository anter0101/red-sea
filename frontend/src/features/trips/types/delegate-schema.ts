import { z } from 'zod';
import { CLIENTS } from '../constants/client';

export const tripSchema = z
  .object({
    carId: z.string().min(1, 'السيارة مطلوبة').optional(),
    trailerId: z.string().min(1, 'المقطورة مطلوبة').optional(),

    driverId: z.string().min(1, 'السائق مطلوب'),
    driverAssistantId: z.string().min(1, 'السائق مطلوب'),

    clientId: z.string().min(1, 'التحميل لصالح مطلوب'),

    saleOrderNumber: z.string().optional(),
    deliveryCompany: z.string().optional(),

    direction: z.string().min(1, 'الجهة مطلوبة'),
    packingType: z.string().min(1, 'نوع التعبئة مطلوب'),
    cementGrade: z.string().min(1, 'رتبة الأسمنت مطلوبة'),
    quantity: z.string().min(1, 'الكمية مطلوبة'),

    custodySourceId: z.string().min(1, 'مصدر العهدة مطلوب'),
    custodyAmount: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clientId === CLIENTS.ARISH) {
      if (!data.saleOrderNumber) {
        ctx.addIssue({
          path: ['saleOrderNumber'],
          message: 'رقم أمر البيع مطلوب',
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.deliveryCompany) {
        ctx.addIssue({
          path: ['deliveryCompany'],
          message: 'اسم شركة التسليم مطلوب',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type TripFormValues = z.infer<typeof tripSchema>;
