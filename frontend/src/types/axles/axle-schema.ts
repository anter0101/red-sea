import { z } from 'zod';

const THICKNESS_MIN = 0;
const THICKNESS_MAX = 100;

const createThicknessField = (t: (key: string) => string) =>
  z
    .number({ error: t('validation.thickness-required') })
    .min(THICKNESS_MIN, { message: t('validation.thickness-min') })
    .max(THICKNESS_MAX, { message: t('validation.thickness-max') });

const TireThicknessSchema = (t: (key: string) => string) =>
  z.object({
    leftOuter: createThicknessField(t),
    leftInner: createThicknessField(t),
    rightOuter: createThicknessField(t),
    rightInner: createThicknessField(t),
  });

const createTypeField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.tire-type-required') })
    .min(1, { message: t('validation.tire-type-required') });

const TireTypeSchema = (t: (key: string) => string) =>
  z.object({
    leftOuter: createTypeField(t),
    leftInner: createTypeField(t),
    rightOuter: createTypeField(t),
    rightInner: createTypeField(t),
  });

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

const createSerialNumberField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.serial-number-required') })
    .min(1, { message: t('validation.serial-number-required') });

const SerialNumberSchema = (t: (key: string) => string) =>
  z.object({
    leftOuter: createSerialNumberField(t),
    leftInner: createSerialNumberField(t),
    rightOuter: createSerialNumberField(t),
    rightInner: createSerialNumberField(t),
  });

const AxleSchema = (t: (key: string) => string) =>
  z.object({
    thickness: TireThicknessSchema(t),
    type: TireTypeSchema(t),
    createdDate: CreatedDateSchema,
    updatedDate: UpdatedDateSchema,
    serialNumber: SerialNumberSchema(t),
  });

export const AxleFormSchema = (t: (key: string) => string) =>
  z.object({
    carId: z.number().optional(),
    trailerId: z.number().optional(),
    axles: z.array(AxleSchema(t)).min(1, t('validation.at-least-one-axle')),
  });

export type TAxleFormValues = z.infer<ReturnType<typeof AxleFormSchema>>;
