import type { IAuditFields } from '../audit-fields';
import type { IAxle } from '../axles/axle';

export interface ITire extends IAuditFields {
  serialNumber: string;
  type: string;
  healthPercentage: string;
  location: string;
  createdDate: Date | string;
  axle?: IAxle;
}
