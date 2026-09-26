import { z } from 'zod';

const THICKNESS_MIN = 0;
const THICKNESS_MAX = 100;

const createThicknessField = (t: (key: string) => string) =>
  z
    .number({ error: t('validation.thickness-required') })
    .min(THICKNESS_MIN, { message: t('validation.thickness-min') })
    .max(THICKNESS_MAX, { message: t('validation.thickness-max') });

const createTypeField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.tire-type-required') })
    .min(1, { message: t('validation.tire-type-required') });

const createSerialNumberField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.serial-number-required') })
    .min(1, { message: t('validation.serial-number-required') });

const CreatedDateSchema = z.object({
  leftOuter: z.date().optional(),
  leftInner: z.date().optional(),
  rightOuter: z.date().optional(),
  rightInner: z.date().optional(),
});

const UpdatedDateSchema = z.object({
  leftOuter: z.date().optional(),
  leftInner: z.date().optional(),
  rightOuter: z.date().optional(),
  rightInner: z.date().optional(),
});

const FullAxleSchema = (t: (key: string) => string) =>
  z.object({
    thickness: z.object({
      leftOuter: createThicknessField(t),
      leftInner: createThicknessField(t),
      rightOuter: createThicknessField(t),
      rightInner: createThicknessField(t),
    }),
    type: z.object({
      leftOuter: createTypeField(t),
      leftInner: createTypeField(t),
      rightOuter: createTypeField(t),
      rightInner: createTypeField(t),
    }),
    createdDate: CreatedDateSchema,
    updatedDate: UpdatedDateSchema,
    serialNumber: z.object({
      leftOuter: createSerialNumberField(t),
      leftInner: createSerialNumberField(t),
      rightOuter: createSerialNumberField(t),
      rightInner: createSerialNumberField(t),
    }),
  });

export const TrailerAxleFormSchema = (t: (key: string) => string) =>
  z.object({
    trailerId: z.number().optional(),
    axles: z.array(FullAxleSchema(t)).min(1, t('validation.at-least-one-axle')),
  });
