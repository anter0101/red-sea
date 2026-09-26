import type { PackingType } from '../enums/packing-type';

export interface IPriceType {
  id: number;
  name: PackingType;
  description: string;
}

export interface IDeliveryPrice {
  id: number;
  priceType: IPriceType;
  basePrice: string;
  additionalFees: string;
  taxPrice: string;
  totalPrice: string;
  nolonPrice?: string;
  validFrom: string;
  validTo: string;
  notes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IArea {
  id: number;
  name: string;
  deliveryPrices: IDeliveryPrice[];
}

export interface IGovernorate {
  id: number;
  name: string;
  areas: IArea[];
}

// Flattened row type for table display
export interface IDeliveryPriceTableRow {
  areaId: number;
  governorateName: string;
  areaName: string;
  prices: Record<PackingType, IDeliveryPrice | null>;
}
