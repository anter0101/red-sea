import type { IAuditFields } from '@/types/audit-fields';
import type { IAxle } from '@/types/axles/axle';

export interface ITrailerOwnership extends Partial<IAuditFields> {
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

export default interface ITrailer extends IAuditFields {
  code?: string;
  chaseType?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  manufactureYear?: number;
  color?: string;
  axleCount?: number;
  plateNumber?: string;
  plateLetters?: string;
  chassisNumber?: string;
  maxWeight?: number;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  ownerShip?: string;
  notes?: string;
  axles?: IAxle[];
  Ownerships?: ITrailerOwnership[];
}
