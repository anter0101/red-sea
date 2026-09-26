import { z } from 'zod';

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { OfficeRequestType } from '../enums/office-request-type';

export interface IOfficeRequestResponse {
  id: number;
  type: OfficeRequestType;
  status: OfficeRequestStatus;
  description?: string | null;
  amount?: number | null;
  journey?: { id: number; delegateNumber?: string };
  requestedFrom?: { id: number; user?: { firstName?: string; lastName?: string } };
  requestedTo?: { id: number; user?: { firstName?: string; lastName?: string } };
  createdAt?: string;
}

export interface IOfficeRequestTableRow {
  id: number;
  type: OfficeRequestType;
  status: OfficeRequestStatus;
  journeyNumber: string;
  amount: string;
  requestedAmount?: number | null;
  fromName: string;
  toName: string;
  createdAt: string;
}

export const officeRequestFormSchema = z
  .object({
    type: z.enum(['PRINT_DELEGATION', 'END_WORKING_SHIFT', 'ASK_FOR_CUSTODY']),
    description: z.string(),
    journeyId: z.string(),
    amount: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'PRINT_DELEGATION' && !v.journeyId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'مطلوب', path: ['journeyId'] });
    }

    if (v.type === 'ASK_FOR_CUSTODY') {
      if (!v.amount.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'مطلوب', path: ['amount'] });
        return;
      }
      const numericAmount = Number(v.amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'يجب أن يكون المبلغ أكبر من صفر',
          path: ['amount'],
        });
      }
    }
  });

export type OfficeRequestFormValues = z.infer<typeof officeRequestFormSchema>;

export interface OfficeRequestBody {
  type: OfficeRequestType;
  description?: string;
  journeyId?: number;
  amount?: number;
}

export function toOfficeRequestBody(values: OfficeRequestFormValues): OfficeRequestBody {
  const body: OfficeRequestBody = { type: values.type };
  if (values.description) body.description = values.description;
  if (values.journeyId) body.journeyId = Number(values.journeyId);
  if (values.amount) body.amount = Number(values.amount);
  return body;
}
