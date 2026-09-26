import { z } from 'zod';

/**
 * Schema for creating a new account.
 *
 * Business rules (enforced by backend, reflected here for UX):
 * - Root accounts (no parentAccountId) → `type` and `normalBalance` are required.
 * - Child accounts (with parentAccountId) → `normalBalance` must be omitted (inherited).
 * - `isLeaf` is auto-managed by the backend — never sent.
 * - `code` is auto-generated — never sent.
 * - `openingBalance` is optional, but once set it is locked forever.
 */
export const createAccountSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('required')).max(255),
    parentAccountId: z.number().optional().nullable(),
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CASH']).optional(),
    normalBalance: z.enum(['DEBIT', 'CREDIT']).optional(),
    openingBalance: z.number().optional(),
  });

export type AccountFormValues = z.infer<ReturnType<typeof createAccountSchema>>;

/**
 * Fields allowed on PUT /accounts/:id
 * normalBalance is immutable — never send on update.
 */
export type AccountUpdateValues = {
  name?: string;
  parentAccountId?: number;
  type?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'CASH';
};
