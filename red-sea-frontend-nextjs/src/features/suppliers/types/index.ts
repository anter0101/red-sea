import type { IAuditFields } from '@/types/audit-fields';
import type { SupplierType } from '@/features/suppliers/enums/supplier-type';

export interface ISupplier extends IAuditFields {
  code?: string;
  name?: string;
  type?: SupplierType;
  government?: { id: number; name: string };
  governmentId?: number;
  phone?: string;
  commercialRegister?: string;
  taxCard?: string;
  taxRegistrationNumber?: string;
}
