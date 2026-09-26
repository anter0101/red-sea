import { z } from 'zod';

import type { CustodyStatus } from '../enums/custody-status';

export interface ICustodyUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  code?: string;
}

export interface ICustodyDriver {
  id?: number;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  user?: ICustodyUser;
}

export interface ICustodyVehicle {
  id?: number;
  plateNumber?: string;
  plateLetters?: string;
  code?: string;
}

export interface ICustodyJourney {
  id?: number;
  delegateNumber?: string;
  delegateDate?: string;
  tripStatus?: string;
  direction?: string;
  quantity?: number;
  cementGrade?: string;
  packingType?: string;
  receivedCompany?: string;
  sellingOrderNo?: string;
  driver?: ICustodyDriver;
  driverAssistant?: ICustodyUser;
  car?: ICustodyVehicle;
  trailer?: ICustodyVehicle;
  client?: { id?: number; name?: string };
}

export interface ICustodyResponse {
  id: number;
  employeeId: number;
  accountId: number;
  journeyId?: number | null;
  driverId?: number | null;
  status: CustodyStatus;
  custodyAmount?: number;
  employee?: { id: number; user?: ICustodyUser };
  account?: { id: number; name?: string; code?: string };
  journey?: ICustodyJourney | null;
  driver?: ICustodyDriver | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustodyTableRow {
  id: number;
  employeeName: string;
  accountName: string;
  custodyAmount: string;
  journeyId?: number | null;
  journeyNumber: string;
  driverName: string;
  driverLicense: string;
  driverAssistantName: string;
  carPlate: string;
  trailerPlate: string;
  status: CustodyStatus;
  createdAt: string;
}

export const custodyFormSchema = z.object({
  employeeId: z.string().min(1, 'مطلوب'),
  accountId: z.string().min(1, 'مطلوب'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']),
  journeyId: z.string(),
  driverId: z.string(),
});

export type CustodyFormValues = z.infer<typeof custodyFormSchema>;

export interface CustodyBody {
  employeeId: number;
  accountId: number;
  status: CustodyStatus;
  journeyId?: number;
  driverId?: number;
}

export function toCustodyBody(values: CustodyFormValues): CustodyBody {
  const body: CustodyBody = {
    employeeId: Number(values.employeeId),
    accountId: Number(values.accountId),
    status: values.status,
  };
  if (values.journeyId) body.journeyId = Number(values.journeyId);
  if (values.driverId) body.driverId = Number(values.driverId);
  return body;
}
