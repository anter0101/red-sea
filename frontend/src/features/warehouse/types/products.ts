import { IAuditFields } from '@/types/audit-fields';

export enum ProductStatus {
  NEW = 'NEW',
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  REFURBISHED = 'REFURBISHED',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

export const ProductConditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: 'جديد',
  [ProductCondition.USED]: 'مستعمل',
  [ProductCondition.DAMAGED]: 'تالف',
  [ProductCondition.EXPIRED]: 'منتهي الصلاحية',
  [ProductCondition.REFURBISHED]: 'تم تجديده',
};

export type ProductPayload = {
  name: string;
  status: ProductStatus;
  condition: ProductCondition;
  category: string;
  quantity?: number;
  alertQuantity: number;
  unit: string;
  supplierId: number;
  unitPrice: number;
  manufacturingYear: number;
  purchaseDate: string;
  expiryDate: string;
};

export interface ProductResponse extends IAuditFields {
  code?: string;
  name: string;
  status: ProductStatus;
  condition: ProductCondition;
  category: string;
  quantity: number;
  alertQuantity: number;
  unit: string;
  supplier?: { id: number; name?: string; code?: string };
  unitPrice: number;
  manufacturingYear: number;
  purchaseDate: string;
  expiryDate: string;
  lastUsedDate?: string | null;
}

export type StockMovementPayload = {
  type: StockMovementType;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  weightNote?: string;
  condition?: ProductCondition;
  manufacturingYear?: number;
  purchaseDate?: string;
  expiryDate?: string;
  reason?: string;
  notes?: string;
};

export interface StockMovementResponse extends IAuditFields {
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  unit?: string;
  unitPrice?: number;
  weightNote?: string;
  condition?: ProductCondition;
  manufacturingYear?: number;
  purchaseDate?: string;
  expiryDate?: string;
  reason?: string;
  notes?: string;
  warehouseId?: number;
}
