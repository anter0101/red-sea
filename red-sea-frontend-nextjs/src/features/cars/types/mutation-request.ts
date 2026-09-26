import { OwnerShipTypes } from '@/enums/ownership';

export default interface ICarMutationRequest {
  manufacturer?: string;
  model?: string;
  status?: string;
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
  ownerShip?: OwnerShipTypes;
  notes?: string;
}

export interface INolonCarMutationRequest {
  ownerShip: OwnerShipTypes.NOLON_CAR;
  plateNumber: string;
  plateLetters: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}
