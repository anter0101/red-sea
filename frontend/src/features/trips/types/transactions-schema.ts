import { z } from 'zod';
import { TripTransactionCategory } from './transactions';

/* =========================================
   Form Schema (UI Layer)
========================================= */

export const tripFeesFormSchema = z.object({
  officeFee: z.coerce.number().min(0).optional(),
  loadingFee: z.coerce.number().min(0).optional(),
  weighingFee: z.coerce.number().min(0).optional(),
  cardFee: z.coerce.number().min(0).optional(),
  crossingFee: z.coerce.number().min(0).optional(),
  permitPortFee: z.coerce.number().min(0).optional(),
  portFee: z.coerce.number().min(0).optional(),
  solarFee: z.coerce.number().min(0).optional(),
  fuelLiters: z.coerce.number().min(0).optional(),
  otherExpenses: z.coerce.number().min(0).optional(),
  cardName: z.string().min(1).optional(),
});

export type TripFeesFormSchema = z.infer<typeof tripFeesFormSchema>;

export const tripTransactionSchema = z.object({
  category: z.nativeEnum(TripTransactionCategory),
  amount: z.number().positive(),
});

export type TripTransactionSchema = z.infer<typeof tripTransactionSchema>;

export const tripFeesPayloadSchema = z.object({
  journeyId: z.number().positive(),
  fuelLiters: z.number().min(0).optional(),
  cardName: z.string().min(1).optional(),
  transactionType: z.enum(['EXPENSE', 'INCOME']),
  transactions: z.array(tripTransactionSchema).min(1),
});

export type TripFeesPayloadSchema = z.infer<typeof tripFeesPayloadSchema>;
export { TripTransactionCategory };
