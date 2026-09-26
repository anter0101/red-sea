import type { IAuditFields } from '@/types/audit-fields';
import type { IAxle } from '@/types/axles/axle';

export interface ICarOwnership extends Partial<IAuditFields> {
  id: number;
  percentage: string | number;
  contractUrl?: string | null;
  notes?: string | null;
  ownerId?: number;
  owner?: {
    id: number;
    name: string;
    phone?: string;
  };
}

export default interface ICar extends IAuditFields {
  code?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  manufactureYear?: number;
  color?: string;
  axleCount?: number;
  plateNumber?: string;
  plateLetters?: string;
  chassisNumber?: string;
  horsepower?: number;
  maxWeight?: number;
  cylinders?: number;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  ownerShip?: string;
  notes?: string;
  axles?: IAxle[];
  Ownerships?: ICarOwnership[];
}
