import z from 'zod';

const createDriverSchema = (t: (key: string) => string) =>
  z.object({
    driverCode: z.string().min(1, t('validation.driver-code-required')),
    firstName: z.string().min(1, t('validation.first-name-required')),
    secondAndThirdName: z.string().min(1, t('validation.second-and-third-name-required')),
    phoneNumber: z.string().min(1, t('validation.phone-number-required')),
    emergencyPhoneNumber: z.string().min(1, t('validation.emergency-phone-number-required')),
    nationalId: z.string().min(1, t('validation.national-id-number-required')),
    nationalIdExpiryDate: z.date({
      error: t('validation.national-id-expiry-date-required'),
    }),
    drivingLicenseNumber: z.string().min(1, t('validation.driving-license-number-required')),
    drivingLicenseExpiryDate: z
      .string()
      .min(1, t('validation.driving-license-expiry-date-required')),
    joiningDate: z.string().min(1, t('validation.joining-date-required')),
    status: z.boolean().default(true),
    drivingLicenseImage: z.instanceof(File).optional(),
    nationalIdImage: z.instanceof(File).optional(),
    criminalRecordCheckImage: z.instanceof(File).optional(),
    securityClearanceImage: z.instanceof(File).optional(),
    medicalInsuranceImage: z.instanceof(File).optional(),
    socialInsuranceImage: z.instanceof(File).optional(),
    militaryServiceStatusImage: z.instanceof(File).optional(),
    salaryType: z.enum(['daily', 'weekly', 'monthly']),
    salary: z.number().min(0, t('validation.salary-required')),
    notes: z.string().optional(),
  });
// Infer the schema type from the function return type
type CreateDriverSchema = ReturnType<typeof createDriverSchema>;
export type ICreateDriverFormSchema = z.infer<CreateDriverSchema>;

export default createDriverSchema;
