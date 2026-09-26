import type { IAuditFields } from '@/types/audit-fields';

import type { ICarManufacturer } from './manufacturer';

export interface ICarModel extends IAuditFields {
  name?: string;
  manufacturer?: ICarManufacturer;
}
