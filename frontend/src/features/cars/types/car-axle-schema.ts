import { z } from 'zod';

const THICKNESS_MIN = 0;
const THICKNESS_MAX = 100;

const createThicknessField = (t: (key: string) => string) =>
  z
    .number({ error: t('validation.thickness-required') })
    .min(THICKNESS_MIN, { message: t('validation.thickness-min') })
    .max(THICKNESS_MAX, { message: t('validation.thickness-max') });

const createOptionalThicknessField = () =>
  z.number().min(THICKNESS_MIN).max(THICKNESS_MAX).default(0);

const createTypeField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.tire-type-required') })
    .min(1, { message: t('validation.tire-type-required') });

const createOptionalTypeField = () => z.string().default('');

const createSerialNumberField = (t: (key: string) => string) =>
  z
    .string({ error: t('validation.serial-number-required') })
    .min(1, { message: t('validation.serial-number-required') });

const createOptionalSerialNumberField = () => z.string().default('');

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

/** Base axle shape: outer tires required; inner optional (for front single-tire axle). */
const FlexibleAxleSchema = (t: (key: string) => string) =>
  z.object({
    thickness: z.object({
      leftOuter: createThicknessField(t),
      leftInner: createOptionalThicknessField(),
      rightOuter: createThicknessField(t),
      rightInner: createOptionalThicknessField(),
    }),
    type: z.object({
      leftOuter: createTypeField(t),
      leftInner: createOptionalTypeField(),
      rightOuter: createTypeField(t),
      rightInner: createOptionalTypeField(),
    }),
    createdDate: CreatedDateSchema,
    updatedDate: UpdatedDateSchema,
    serialNumber: z.object({
      leftOuter: createSerialNumberField(t),
      leftInner: createOptionalSerialNumberField(),
      rightOuter: createSerialNumberField(t),
      rightInner: createOptionalSerialNumberField(),
    }),
  });

export const CarAxleFormSchema = (t: (key: string) => string) =>
  z
    .object({
      carId: z.number().optional(),
      axles: z.array(FlexibleAxleSchema(t)).min(1, t('validation.at-least-one-axle')),
    })
    .superRefine((data, ctx) => {
      data.axles.forEach((axle, index) => {
        if (index === 0) return;

        const result = FullAxleSchema(t).safeParse(axle);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ['axles', index, ...(issue.path ?? [])],
            });
          });
        }
      });
    });
