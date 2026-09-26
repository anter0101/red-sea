import type { IAuditFields } from '@/types/audit-fields';

export default interface ITire extends IAuditFields {
  id?: number;
  serialNumber?: string;
  type?: string;
  healthPercentage?: string;
  location?: string;
  createdDate?: string;
}

export interface IAxle extends IAuditFields {
  id?: number;
  number?: number;
  carId?: number;
  trailerId?: number;
  car?: {
    id: number;
    code: string;
    manufacturer: string;
  };
  trailer?: {
    id: number;
    code: string;
    manufacturer: string;
  };
  tires?: ITire[];
}

export interface IUpdateAxleTire {
  id?: number;
  serialNumber: string;
  type: string;
  healthPercentage: string;
  location: string;
  createdDate?: string;
}

export interface IUpdateAxleItem {
  id: number;
  number: number;
  tires: IUpdateAxleTire[];
}

// Bulk update request - array of axle items
export type IUpdateAxleRequest = IUpdateAxleItem[];

export interface IAxleFormValues {
  carId?: number;
  trailerId?: number;
  axles: Array<{
    thickness: {
      leftOuter: number;
      leftInner: number;
      rightOuter: number;
      rightInner: number;
    };
    type: {
      leftOuter: string;
      leftInner: string;
      rightOuter: string;
      rightInner: string;
    };
    createdDate: {
      leftOuter?: Date;
      leftInner?: Date;
      rightOuter?: Date;
      rightInner?: Date;
    };
    updatedDate: {
      leftOuter?: Date;
      leftInner?: Date;
      rightOuter?: Date;
      rightInner?: Date;
    };
    serialNumber: {
      leftOuter: string;
      leftInner: string;
      rightOuter: string;
      rightInner: string;
    };
  }>;
}
