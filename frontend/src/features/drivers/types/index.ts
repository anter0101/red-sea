import type { IAuditFields } from '@/types/audit-fields';
import type { IUser } from '@/types/user/index';

export interface IDriver extends IAuditFields {
  licenseNumber: string;
  licenseExpiryDate?: Date | string;
  user?: IUser;
  currentJourneyId?: number;
  currentCarCode?: string;
}
