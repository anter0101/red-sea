import { z } from 'zod';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MIN_AXLE_COUNT = 1;

export const TrailersSchema = (t: (key: string) => string) =>
  z.object({
    chaseType: z
      .string({ error: t('validation.chase-type-required') })
      .min(1, { message: t('validation.chase-type-required') }),
    manufacturer: z
      .string({ error: t('validation.manufacturer-required') })
      .min(1, { message: t('validation.manufacturer-required') }),
    status: z.boolean(),
    manufactureYear: z
      .number({ error: t('validation.manufacture-year-required') })
      .min(MIN_YEAR, { message: t('validation.manufacture-year-invalid') })
      .max(MAX_YEAR, { message: t('validation.manufacture-year-invalid') }),
    color: z
      .string({ error: t('validation.color-required') })
      .min(1, { message: t('validation.color-required') }),
    axleCount: z.number({ error: t('validation.axle-count-required') }).min(MIN_AXLE_COUNT, {
      message: t('validation.axle-count-must-be-positive'),
    }),
    maxWeight: z
      .number({ error: t('validation.max-weight-required') })
      .min(1, { message: t('validation.max-weight-must-be-positive') }),
    plateNumber: z
      .string({ error: t('validation.plate-number-required') })
      .min(1, { message: t('validation.plate-number-required') }),
    plateLetters: z
      .string({ error: t('validation.plate-letters-required') })
      .min(1, { message: t('validation.plate-letters-required') }),
    chassisNumber: z
      .string({ error: t('validation.chassis-number-required') })
      .min(1, { message: t('validation.chassis-number-required') }),
    licenseNumber: z
      .string({ error: t('validation.license-number-required') })
      .min(1, { message: t('validation.license-number-required') }),
    licenseExpiryDate: z.date({
      error: t('validation.license-expiry-date-required'),
    }),
    notes: z.string().optional(),
  });

export const NolonTrailerSchema = (t: (key: string) => string) =>
  z.object({
    plateNumber: z
      .string({ error: t('validation.plate-number-required') })
      .min(1, { message: t('validation.plate-number-required') }),
    plateLetters: z
      .string({ error: t('validation.plate-letters-required') })
      .min(1, { message: t('validation.plate-letters-required') }),
    licenseNumber: z
      .string({ error: t('validation.license-number-required') })
      .min(1, { message: t('validation.license-number-required') }),
    licenseExpiryDate: z.date({
      error: t('validation.license-expiry-date-required'),
    }),
  });

export type ITrailersFormValues = z.infer<ReturnType<typeof TrailersSchema>>;
export type INolonTrailerFormValues = z.infer<ReturnType<typeof NolonTrailerSchema>>;
export default ITrailersFormValues;
