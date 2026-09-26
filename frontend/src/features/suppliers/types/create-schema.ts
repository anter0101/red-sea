import z from 'zod';
import { SupplierType } from '@/features/suppliers/enums/supplier-type';

export const SupplierSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(3, t('validation.name-min')).max(255, t('validation.name-max')),

    type: z.nativeEnum(SupplierType, {
      message: t('validation.type-required'),
    }),

    governmentId: z.string().min(1, t('validation.governorate-required')),

    phone: z.string().regex(/^01[0125][0-9]{8}$/, t('validation.phone-invalid')),

    commercialRegister: z
      .string()
      .min(1, t('validation.commercial-register-required'))
      .max(50, t('validation.commercial-register-max')),

    taxCard: z
      .string()
      .min(1, t('validation.tax-card-required'))
      .max(50, t('validation.tax-card-max')),

    taxRegistrationNumber: z
      .string()
      .min(1, t('validation.tax-registration-required'))
      .max(50, t('validation.tax-registration-max')),

    branchId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === SupplierType.TRANSPORTATION && !value.branchId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branchId'],
        message: 'الفرع مطلوب لمورد النقل',
      });
    }
  });

export type SupplierFormValues = z.infer<ReturnType<typeof SupplierSchema>>;
