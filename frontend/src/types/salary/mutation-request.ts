import type { SalaryTypes } from '@/enums/salary-types';

export interface ICreateSalaryRequest {
  salaryType?: SalaryTypes;
  salaryAmount?: number | null;
  dailyWorkPrice?: number | null;
  commissionPerJourney?: number | null;
  commissionIsPercentage?: boolean | null;
  nolonPercent?: number | null;
  userId?: number;
}
