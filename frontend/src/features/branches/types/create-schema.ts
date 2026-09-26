import { z } from 'zod';

export const BranchSchema = z.object({
  name: z.string().min(2, 'اسم الفرع يجب أن يكون على الأقل حرفين').max(100, 'اسم الفرع طويل جدًا'),
});

export type BranchFormValues = z.infer<typeof BranchSchema>;
