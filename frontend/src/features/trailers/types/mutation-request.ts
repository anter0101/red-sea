import { OwnerShipTypes } from '@/enums/ownership';

export default interface ITrailerMutationRequest {
  chaseType?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  manufactureYear?: number;
  color?: string;
  axleCount?: number;
  maxWeight?: number;
  plateNumber?: string;
  plateLetters?: string;
  chassisNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  ownerShip?: string;
  notes?: string;
}

export interface INolonTrailerMutationRequest {
  ownerShip: OwnerShipTypes.NOLON_CAR;
  plateNumber: string;
  plateLetters: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

