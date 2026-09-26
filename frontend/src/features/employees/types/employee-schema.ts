import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const createEmployeeSchema = (t: (key: string) => string, isEdit = false) => {
  const passwordField = z
    .string()
    .min(1, { message: t('validation.password-required') })
    .min(8, { message: t('validation.password-min-length') })
    .regex(passwordRegex, { message: t('validation.password-complexity') });

  return z
    .object({
      id: z.number().optional(),
      firstName: z.string().min(1, { message: t('validation.first-name-required') }),
      lastName: z.string().min(1, { message: t('validation.last-name-required') }),
      email: z
        .string()
        .min(1, { message: t('validation.email-required') })
        .email({ message: t('validation.email-invalid') }),
      password: isEdit ? z.string().optional() : passwordField,
      confirmPassword: z.string().optional(),
      phone: z.string().optional(),
      personalId: z.string().optional(),
      personalIdExpiryDate: z.date().optional(),
      branchId: z.number().optional(),
      joinDate: z.date().optional(),
      salaryAmount: z.string().optional(),
      salaryType: z.string().optional(),
      status: z.string().optional(),
      activated: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isEdit) {
        if (!data.password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.password-required'),
            path: ['password'],
          });
        }
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.passwords-must-match'),
            path: ['confirmPassword'],
          });
        }
        return;
      }

      if (data.password) {
        if (data.password.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.password-min-length'),
            path: ['password'],
          });
        } else if (!passwordRegex.test(data.password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.password-complexity'),
            path: ['password'],
          });
        }
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.passwords-must-match'),
            path: ['confirmPassword'],
          });
        }
      }
    });
};

export type CreateEmployeeFormValues = z.infer<ReturnType<typeof createEmployeeSchema>>;
