import { z } from 'zod';

export const createTransactionLineSchema = (t: (key: string) => string) =>
  z.object({
    transactionId: z.number().min(1, t('required')),
    accountId: z.number().min(1, t('required')),
    entryType: z.enum(['DEBIT', 'CREDIT']),
    amount: z.number().min(0),
    description: z.string().optional(),
  });

export type TransactionLineFormValues = z.infer<ReturnType<typeof createTransactionLineSchema>>;
