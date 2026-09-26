import { IAuditFields } from '@/types/audit-fields';

/* ===================== GPS ===================== */
export interface IGpsTail extends IAuditFields {
  id?: number;

  latitude?: number;
  longitude?: number;

  sequenceOrder?: number;
  timestamp?: string;
}

/* ===================== CAR ===================== */
export interface ICar extends IAuditFields {
  id?: number;

  code?: string;
  manufacturer?: string;
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

  model?: string;
  manufactureYear?: number;
  color?: string;

  cylinders?: number;
  horsepower?: number;
  axleCount?: number;
  maxWeight?: number;

  plateNumber?: string;
  plateLetters?: string;

  chassisNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;

  notes?: string;

  ownerShip?: 'OWNED' | 'RENTED' | 'LEASED';

  carAttachments?: any[];
  axles?: any[];
  Ownerships?: any[];
}

export interface IAssignCarRequest {
  carId: number;
}
/* ===================== DEVICE ===================== */
export interface IDeviceResponse extends IAuditFields {
  id?: number;

  name?: string;
  imei?: string;

  lastLatitude?: number;
  lastLongitude?: number;

  speed?: number;
  totalDistance?: number;

  batteryLevel?: number | null;
  signalStrength?: number;

  engineStatus?: boolean;

  lastUpdate?: string;

  car?: ICar;

  gpsTail?: IGpsTail[];
}
