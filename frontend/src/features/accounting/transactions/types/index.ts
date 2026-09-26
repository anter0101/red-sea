import { z } from 'zod';

const transactionLineSchema = z.object({
  accountId: z.number().min(1),
  entryType: z.enum(['DEBIT', 'CREDIT']),
  amount: z.number().min(0),
  description: z.string().optional(),
});

export const createTransactionSchema = (t: (key: string) => string) =>
  z.object({
    date: z.string().min(1, t('required')),
    description: z.string().min(1, t('required')),
    status: z.enum(['DRAFT', 'POSTED', 'CANCELLED']),
    /**
     * Minimum 2 lines required — backend validates debits must equal credits.
     * Each account may appear only once and must be a leaf account.
     */
    transactionLines: z.array(transactionLineSchema).min(2, t('required')),
  });

export type TransactionLineInput = z.infer<typeof transactionLineSchema>;
export type TransactionFormValues = z.infer<ReturnType<typeof createTransactionSchema>>;

/**
 * Fields allowed on PUT /transactions/:id.
 * Cannot update transactionLines through this endpoint.
 * Cannot modify POSTED or CANCELLED transactions.
 */
export interface UpdateTransactionBody {
  date?: string;
  description?: string;
  status?: 'DRAFT' | 'POSTED' | 'CANCELLED';
}
