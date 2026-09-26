import { z } from 'zod';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export const CarsSchema = (t: (key: string) => string) =>
  z.object({
    manufacturer: z
      .string({ error: t('validation.manufacturer-required') })
      .min(1, { message: t('validation.manufacturer-required') }),
    model: z
      .string({ error: t('validation.model-required') })
      .min(1, { message: t('validation.model-required') }),
    status: z.boolean(),
    manufactureYear: z
      .number({ error: t('validation.manufacture-year-required') })
      .min(MIN_YEAR, { message: t('validation.manufacture-year-invalid') })
      .max(MAX_YEAR, { message: t('validation.manufacture-year-invalid') }),
    color: z
      .string({ error: t('validation.color-required') })
      .min(1, { message: t('validation.color-required') }),
    cylinders: z
      .number({ error: t('validation.cylinders-required') })
      .min(1, { message: t('validation.cylinders-must-be-positive') }),
    horsepower: z
      .number({ error: t('validation.horsepower-required') })
      .min(1, { message: t('validation.horsepower-must-be-positive') }),
    axleCount: z
      .number({ error: t('validation.axle-count-required') })
      .min(1, { message: t('validation.axle-count-must-be-positive') }),
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
    driverAssistantId: z.number().optional(),
  });

export const NolonCarSchema = (t: (key: string) => string) =>
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

export type ICarsFormValues = z.infer<ReturnType<typeof CarsSchema>>;
export type INolonCarFormValues = z.infer<ReturnType<typeof NolonCarSchema>>;
export default ICarsFormValues;
