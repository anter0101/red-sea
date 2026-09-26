import type { IAuditFields } from '@/types/audit-fields';
import type { IAxle } from '@/types/axles';
import type { IUser } from '@/types/user/index';

export interface IPartner extends IAuditFields {
  name: string;
  companyName?: string;
  phone?: string;
  transactionType?: 'INSTAPAY' | 'VODAFONE_CASH'; // <-- FIXED
  transferNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
}

// Request type for creating a new owner (matches API format)
export interface ICreateOwnerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  transactionType?: 'INSTAPAY' | 'VODAFONE_CASH';
  paymentNumber?: string;
  notes?: string;
}

// Response type from create owner API
export interface IOwnerResponse {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  transactionType?: string;
  paymentNumber?: string;
  notes?: string;
}

export type PartnerApi = {
  id: number;
  name: string;
  phone: string;
  carOwnerships: {
    id: number;
    percentage: string;
    car: {
      id: number;
      createdBy: string;
      createdAt: string;
      updatedBy: string;
      updatedAt: string;
      code: string;
      manufacturer: string;
      status: string;
      model: string;
      manufactureYear: number;
      color: string;
      cylinders: number;
      horsepower: number;
      axleCount: number;
      maxWeight: number;
      plateNumber: string;
      plateLetters: string;
      chassisNumber: string;
      licenseNumber: string;
      licenseExpiryDate: string;
      notes: string;
      ownerShip: string;
      carAttachments: [];
      axles: IAxle[];
      Ownerships: {
        id: number;
        percentage: string;
        contractUrl: string | null;
      }[];
    };
  }[];
  trailerOwnerships: [];
  createdAt: string;
  createdBy: string;
};

export type PartnerEntity = {
  id: string;
  name: string;
  joinDate: string;
  addedBy: string;
  address: string;
  contributionType: string;
  contributionPercent: string;
  instapayOrVodafone: string;
  paymentMethod: string;
};
