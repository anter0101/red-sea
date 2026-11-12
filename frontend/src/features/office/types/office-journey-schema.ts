import { z } from 'zod';

import type { VehicleMode } from '../enums/vehicle-mode';

// --- Inline schemas (static, for type inference) ---

export const driverInlineSchema = z.object({
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    nationalId: z.string().min(1),
    phoneNumber: z.string().min(1),
  }),
});
export type DriverInline = z.infer<typeof driverInlineSchema>;

export const carInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});
export type CarInline = z.infer<typeof carInlineSchema>;

export const trailerInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});
export type TrailerInline = z.infer<typeof trailerInlineSchema>;

// --- Schema factory functions with translated messages (used in dialogs) ---

type T = (key: string) => string;

export const makeCarInlineSchema = (t: T) =>
  z.object({
    plateNumber: z.string().min(1, t('validation.required')),
    plateLetters: z.string().min(1, t('validation.required')),
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
  });

export const makeTrailerInlineSchema = (t: T) =>
  z.object({
    plateNumber: z.string().min(1, t('validation.required')),
    plateLetters: z.string().min(1, t('validation.required')),
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
  });

export const makeDriverInlineSchema = (t: T) =>
  z.object({
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
    user: z.object({
      firstName: z.string().min(1, t('validation.required')),
      lastName: z.string().min(1, t('validation.required')),
      nationalId: z.string().min(1, t('validation.required')),
      phoneNumber: z.string().min(1, t('validation.required')),
    }),
  });

export function paysTransportSupplier(vehicleMode: VehicleMode): boolean {
  return vehicleMode === 'NOLON_CAR' || vehicleMode === 'CONTRACT_CAR';
}

// --- Form values type ---

export interface OfficeJourneyFormValues {
  vehicleMode: VehicleMode;
  clientId: string;
  carId: string;
  carInline?: CarInline;
  trailerId: string;
  trailerInline?: TrailerInline;
  driverId: string;
  driverInline?: DriverInline;
  driverAssistantId: string;
  direction: string;
  sellingOrderNo: string;
  receivedCompany: string;
  packingType: string;
  cementGrade: string;
  quantity: string;
  custodyAmount: string;
  transportSupplierId: string;
}

export const emptyOfficeJourneyValues: OfficeJourneyFormValues = {
  vehicleMode: 'NOLON_CAR',
  clientId: '',
  carId: '',
  trailerId: '',
  driverId: '',
  driverAssistantId: '',
  direction: '',
  sellingOrderNo: '',
  receivedCompany: '',
  packingType: '',
  cementGrade: '',
  quantity: '',
  custodyAmount: '',
  transportSupplierId: '',
};

// --- API payload type (object-key form: { id } for existing, { create } for inline) ---

export interface CreateOfficeJourneyPayload {
  vehicleMode: VehicleMode;
  clientId: number;
  car?: { create: CarInline };
  carId?: number;
  trailer?: { create: TrailerInline };
  trailerId?: number;
  driver?: { create: DriverInline };
  driverId?: number;
  driverAssistantId?: number;
  sellingOrderNo?: string;
  direction?: string;
  receivedCompany?: string;
  packingType?: string;
  cementGrade?: string;
  quantity?: number;
  custodyAmount?: number;
  transportSupplierId?: number;
}

export function buildOfficeJourneyPayload(
  values: OfficeJourneyFormValues,
): CreateOfficeJourneyPayload {
  const isNolon = values.vehicleMode === 'NOLON_CAR';

  const payload: CreateOfficeJourneyPayload = {
    vehicleMode: values.vehicleMode,
    clientId: Number(values.clientId),
  };

  // Inline creation wraps the object in { create: ... }; select mode sends the flat id shorthand.
  if (isNolon && values.carInline) payload.car = { create: { ...values.carInline } };
  else if (values.carId) payload.carId = Number(values.carId);

  if (isNolon && values.trailerInline) payload.trailer = { create: { ...values.trailerInline } };
  else if (values.trailerId) payload.trailerId = Number(values.trailerId);

  if (isNolon && values.driverInline) payload.driver = { create: { ...values.driverInline } };
  else if (values.driverId) payload.driverId = Number(values.driverId);

  // General optional fields (all modes).
  if (values.driverAssistantId) payload.driverAssistantId = Number(values.driverAssistantId);
  if (values.sellingOrderNo) payload.sellingOrderNo = values.sellingOrderNo;
  if (values.direction) payload.direction = values.direction;
  if (values.receivedCompany) payload.receivedCompany = values.receivedCompany;
  if (values.packingType) payload.packingType = values.packingType;
  if (values.cementGrade) payload.cementGrade = values.cementGrade;
  if (values.quantity) payload.quantity = Number(values.quantity);
  if (values.custodyAmount) payload.custodyAmount = Number(values.custodyAmount);
  if (paysTransportSupplier(values.vehicleMode) && values.transportSupplierId) {
    payload.transportSupplierId = Number(values.transportSupplierId);
  }

  return payload;
}

// --- Validation schema ---

export function makeOfficeJourneySchema(maxCustody: number) {
  return z
    .object({
      vehicleMode: z.enum(['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR']),
      clientId: z.string().min(1, 'مطلوب'),
      carId: z.string(),
      carInline: carInlineSchema.optional(),
      trailerId: z.string(),
      trailerInline: trailerInlineSchema.optional(),
      driverId: z.string(),
      driverInline: driverInlineSchema.optional(),
      driverAssistantId: z.string(),
      direction: z.string(),
      sellingOrderNo: z.string(),
      receivedCompany: z.string(),
      packingType: z.string(),
      cementGrade: z.string(),
      quantity: z.string(),
      custodyAmount: z
        .string()
        .refine((v) => !v || Number(v) <= maxCustody, `لا يمكن أن يتجاوز ${maxCustody}`),
      transportSupplierId: z.string(),
    })
    .superRefine((v, ctx) => {
      const hasCar = !!v.carId || !!v.carInline;
      if (!hasCar) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'السيارة مطلوبة', path: ['carId'] });
      }
      if (paysTransportSupplier(v.vehicleMode) && !v.transportSupplierId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'مورد النقل مطلوب للنولون والعقد',
          path: ['transportSupplierId'],
        });
      }
    });
}

export const officeJourneySchema = makeOfficeJourneySchema(Infinity);
