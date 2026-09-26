import type { IAuditFields } from '@/types/audit-fields';
import type { PricingSheetKind } from '../enums/pricing-sheet-kind';

export interface IClient extends IAuditFields {
  name: string;
  companyCode: string;
  commercialRecord: string;
  taxInvoice?: string;
  taxCard?: string;
  electronicRegistration?: string;
  destinationsFile?: string;
  pricingSheetKind: PricingSheetKind;
}
