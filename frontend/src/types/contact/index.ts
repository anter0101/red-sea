import type { IAuditFields } from '../audit-fields';
import type { IUser } from '../user/index';

export interface IContact extends IAuditFields {
  phone?: string;
  address?: string;
  user?: IUser;
  isPrimary?: boolean;
}
