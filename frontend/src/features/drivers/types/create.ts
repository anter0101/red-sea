import z from 'zod';

import { UserRoles } from '@/enums/users/user-roles';

export const createDriverSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number().optional(),
    firstName: z.string().min(1, t('validation.first-name-required')),
    lastName: z.string().min(1, t('validation.last-name-required')),
    activated: z.boolean(),
    role: z.enum(UserRoles),
    personalId: z
      .string()
      .min(14, t('validation.personal-id-must-be-14-digits'))
      .max(14, t('validation.personal-id-must-be-14-digits')),
    personalIdExpiryDate: z.date({
      message: t('validation.personal-id-expiry-date-required'),
    }),
    licenseNumber: z.string().min(1, t('validation.driving-license-number-required')),
    licenseExpiryDate: z.date({
      message: t('validation.driving-license-expiry-date-required'),
    }),
    notes: z.string(),
    joinDate: z.date(),
    phoneNumber: z
      .string()
      .min(11, t('validation.phone-number-must-be-11-digits'))
      .max(11, t('validation.phone-number-must-be-11-digits')),
    emergencyPhoneNumber: z
      .string()
      .max(11, t('validation.phone-number-must-be-11-digits'))
      .optional()
      .or(z.literal('')),
  });

export type CreateDriverFormValues = z.infer<ReturnType<typeof createDriverSchema>>;
