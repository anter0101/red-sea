import type { SalaryTypes } from '@/enums/salary-types';
import type { IAuditFields } from '@/types/audit-fields';
import type { IUser } from '@/types/user/index';

export interface ISalary extends IAuditFields {
  salaryType?: SalaryTypes;
  salaryAmount?: string | number | null;
  dailyWorkPrice?: string | number | null;
  commissionPerJourney?: string | number | null;
  commissionIsPercentage?: boolean | null;
  nolonPercent?: string | number | null;
  user?: IUser;
}
