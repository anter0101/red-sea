import type { UserRoles } from '@/enums/users/user-roles';
import type { UserStatus } from '@/enums/users/user-status';
import type { IAuditFields } from '@/types/audit-fields';
import type { IContact } from '@/types/contact/index';
import type { ISalary } from '@/types/salary/index';

export interface IUserAttachment {
  id: number;
  url: string;
  type: string;
  notes?: string;
  documentExpiryDate?: Date | string;
}

export interface IUser extends IAuditFields {
  username?: string;
  email?: string;
  activated?: boolean;
  imageUrl?: string;
  role?: UserRoles;
  firstName?: string;
  lastName?: string;
  personalId?: string;
  personalIdExpiryDate?: Date | string;
  notes?: string | null;
  password?: string | null;
  code?: string | null;
  contacts?: IContact[];
  status?: UserStatus;
  salary?: ISalary;
  userAttachments?: IUserAttachment[];
  currentJourneyId?: number;
  currentCarId?: number;
  currentCarCode?: string;
}
