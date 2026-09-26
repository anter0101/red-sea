import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),

  status: z.enum([
    'NEW',
    'AVAILABLE',
    'OUT_OF_STOCK',
    'PENDING',
    'RESERVED',
    'DISCONTINUED',
  ]),

  condition: z.enum(['NEW', 'USED', 'DAMAGED', 'EXPIRED', 'REFURBISHED']),

  category: z.string().min(1, 'الفئة مطلوبة'),

  quantity: z.coerce.number().int().min(0, 'الكمية لا يمكن أن تكون سالبة'),

  alertQuantity: z.coerce.number().int().min(0, 'عدد التنبيه لا يمكن أن يكون سالبًا'),

  unit: z.string().min(1, 'الوحدة مطلوبة'),

  supplierId: z.string().min(1, 'المورد مطلوب'),

  unitPrice: z.coerce.number().int().min(0, 'سعر الوحدة يجب أن يكون أكبر من صفر'),

  manufacturingYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),

  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة تاريخ الشراء غير صحيحة'),

  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة تاريخ الصلاحية غير صحيحة'),
});
export type ProductFormValues = z.infer<typeof ProductSchema>;
