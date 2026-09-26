import type { IAuditFields } from '@/types/audit-fields';
import type { IUser } from '@/types/user/index';

export interface IEmployee extends IAuditFields {
  custody?: number;
  branchId?: number;
  factoryId?: number;
  user?: IUser;
}

export interface IEmployeeTableRow {
  id: number;
  name: string;
  role: string;
  custody: string;
  lastSeen: string;
  status: string;
  salary: string;
  salaryType: string;
  joinDate: string;
}
