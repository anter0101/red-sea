import z from 'zod';

export const PartnerSchema = z.object({
  name: z
    .string()
    .min(2, 'اسم الشريك يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم الشريك طويل جدًا'),

  phone: z.string().optional(),

  transactionType: z.enum(['INSTAPAY', 'VODAFONE_CASH']),

  email: z.string().email('البريد الإلكتروني غير صالح').optional(),

  address: z
    .string()
    .min(5, 'العنوان يجب أن يكون مفصلًا أكثر')
    .max(255, 'العنوان طويل جدًا')
    .optional(),
});

export type PartnerFormValues = z.infer<typeof PartnerSchema>;
