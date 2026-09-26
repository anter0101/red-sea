import z from 'zod';

import { PricingSheetKind } from '../enums/pricing-sheet-kind';

export const ClientSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('validation.name-min')).max(100, t('validation.name-max')),

    commercialRecord: z
      .string()
      .min(5, t('validation.commercial-record-min'))
      .max(50, t('validation.commercial-record-max')),

    taxInvoice: z.string().optional(),

    taxCard: z.string().optional(),

    electronicRegistration: z.string().optional(),

    destinationsFile: z.string().optional(),

    pricingSheetKind: z.nativeEnum(PricingSheetKind, {
      message: t('validation.pricing-sheet-kind-required'),
    }),
  });

export type ClientFormValues = z.infer<ReturnType<typeof ClientSchema>>;
