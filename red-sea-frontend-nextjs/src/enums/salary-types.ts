export enum SalaryTypes {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  COMMISSION = 'COMMISSION',
  NOLON_PERCENT = 'NOLON_PERCENT',
}

/** Schemes shown on driver / driver-assistant salary forms */
export const DRIVER_SALARY_SCHEMES = [
  SalaryTypes.MONTHLY,
  SalaryTypes.COMMISSION,
  SalaryTypes.NOLON_PERCENT,
] as const;

export type DriverSalaryScheme = (typeof DRIVER_SALARY_SCHEMES)[number];
