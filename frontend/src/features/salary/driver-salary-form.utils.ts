import { z } from 'zod';

import { DRIVER_SALARY_SCHEMES, SalaryTypes } from '@/enums/salary-types';

const optionalPositiveNumberString = (message: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val?.trim()) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message },
    );

export const driverSalaryFormSchema = (t: (key: string) => string) =>
  z
    .object({
      id: z.number().optional(),
      salaryType: z.enum(DRIVER_SALARY_SCHEMES, {
        error: t('validation.salary-type-required'),
      }),
      salaryAmount: optionalPositiveNumberString(t('validation.salary-must-be-positive')),
      dailyWorkPrice: optionalPositiveNumberString(t('validation.daily-work-price-must-be-positive')),
      commissionPerJourney: optionalPositiveNumberString(
        t('validation.commission-per-journey-must-be-positive'),
      ),
      commissionIsPercentage: z.boolean().optional(),
      nolonPercent: optionalPositiveNumberString(t('validation.nolon-percent-must-be-positive')),
    })
    .superRefine((data, ctx) => {
      if (data.salaryType === SalaryTypes.MONTHLY) {
        const amount = data.salaryAmount?.trim() ? parseFloat(data.salaryAmount) : NaN;
        if (!amount || amount <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['salaryAmount'],
            message: t('validation.salary-required'),
          });
        }
      }
      if (
        data.salaryType === SalaryTypes.MONTHLY ||
        data.salaryType === SalaryTypes.COMMISSION
      ) {
        const daily = data.dailyWorkPrice?.trim() ? parseFloat(data.dailyWorkPrice) : NaN;
        if (data.dailyWorkPrice?.trim() && (isNaN(daily) || daily < 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dailyWorkPrice'],
            message: t('validation.daily-work-price-must-be-positive'),
          });
        }
      }
    });

export type DriverSalaryFormValues = z.infer<ReturnType<typeof driverSalaryFormSchema>>;

function toNum(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function buildSalaryPayload(
  data: DriverSalaryFormValues,
  userId: number,
): {
  id?: number;
  salaryType: DriverSalaryFormValues['salaryType'];
  salaryAmount?: number | null;
  dailyWorkPrice?: number | null;
  commissionPerJourney?: number | null;
  commissionIsPercentage?: boolean | null;
  nolonPercent?: number | null;
  userId: number;
} {
  const type = data.salaryType;
  const base = {
    ...(data.id && { id: data.id }),
    salaryType: type,
    userId,
  };

  if (type === SalaryTypes.MONTHLY) {
    return {
      ...base,
      salaryAmount: toNum(data.salaryAmount) ?? null,
      dailyWorkPrice: toNum(data.dailyWorkPrice) ?? null,
      commissionPerJourney: null,
      commissionIsPercentage: null,
      nolonPercent: null,
    };
  }
  if (type === SalaryTypes.COMMISSION) {
    return {
      ...base,
      salaryAmount: null,
      dailyWorkPrice: toNum(data.dailyWorkPrice) ?? null,
      commissionPerJourney: null,
      commissionIsPercentage: null,
      nolonPercent: null,
    };
  }
  // NOLON_PERCENT — selector only; trip pay from sheet nolonPrice
  return {
    ...base,
    salaryAmount: null,
    dailyWorkPrice: null,
    commissionPerJourney: null,
    commissionIsPercentage: null,
    nolonPercent: null,
  };
}

export function salaryToFormDefaults(salary?: {
  id?: number;
  salaryType?: string;
  salaryAmount?: string | number | null;
  dailyWorkPrice?: string | number | null;
  commissionPerJourney?: string | number | null;
  commissionIsPercentage?: boolean | null;
  nolonPercent?: string | number | null;
} | null): DriverSalaryFormValues {
  const type = (salary?.salaryType as DriverSalaryFormValues['salaryType']) ?? SalaryTypes.MONTHLY;
  const scheme = DRIVER_SALARY_SCHEMES.includes(type as (typeof DRIVER_SALARY_SCHEMES)[number])
    ? type
    : SalaryTypes.MONTHLY;

  return {
    id: salary?.id,
    salaryType: scheme,
    salaryAmount: salary?.salaryAmount != null ? String(salary.salaryAmount) : '',
    dailyWorkPrice: salary?.dailyWorkPrice != null ? String(salary.dailyWorkPrice) : '',
    commissionPerJourney: '',
    commissionIsPercentage: false,
    nolonPercent: '',
  };
}

export function formatSalarySummary(
  salary: {
    salaryType?: string;
    salaryAmount?: string | number | null;
    dailyWorkPrice?: string | number | null;
    commissionPerJourney?: string | number | null;
    commissionIsPercentage?: boolean | null;
    nolonPercent?: string | number | null;
  } | null | undefined,
  t: (key: string) => string,
  notSpecified: string,
): string {
  if (!salary?.salaryType) return notSpecified;

  const typeLabel =
    salary.salaryType === SalaryTypes.COMMISSION
      ? t('salary-types.commission')
      : salary.salaryType === SalaryTypes.NOLON_PERCENT
        ? t('salary-types.nolon-percent')
        : salary.salaryType === SalaryTypes.MONTHLY
          ? t('salary-types.monthly')
          : salary.salaryType;

  const parts: string[] = [typeLabel];

  if (salary.salaryType === SalaryTypes.MONTHLY) {
    if (salary.salaryAmount != null && salary.salaryAmount !== '') {
      parts.push(`${salary.salaryAmount}`);
    }
    if (salary.dailyWorkPrice != null && salary.dailyWorkPrice !== '') {
      parts.push(`${t('fields.daily-work-price')}: ${salary.dailyWorkPrice}`);
    }
  } else if (salary.salaryType === SalaryTypes.COMMISSION) {
    if (salary.dailyWorkPrice != null && salary.dailyWorkPrice !== '') {
      parts.push(`${t('fields.daily-work-price')}: ${salary.dailyWorkPrice}`);
    }
  } else if (salary.salaryType === SalaryTypes.NOLON_PERCENT) {
    parts.push(t('salary-type-descriptions.nolon-percent-short'));
  } else if (salary.salaryAmount != null && salary.salaryAmount !== '') {
    parts.push(String(salary.salaryAmount));
  }

  return parts.join(' · ') || notSpecified;
}

/** Compact cell value for tables */
export function mapSalaryCellValue(
  salary: {
    salaryType?: string;
    salaryAmount?: string | number | null;
    dailyWorkPrice?: string | number | null;
    nolonPercent?: string | number | null;
  } | null | undefined,
  empty: string,
): string {
  if (!salary) return empty;
  if (
    salary.salaryType === SalaryTypes.MONTHLY &&
    salary.salaryAmount != null &&
    salary.salaryAmount !== ''
  ) {
    return String(salary.salaryAmount);
  }
  if (salary.salaryType === SalaryTypes.COMMISSION && salary.dailyWorkPrice != null) {
    return String(salary.dailyWorkPrice);
  }
  if (salary.salaryType === SalaryTypes.NOLON_PERCENT) {
    return 'nolon';
  }
  if (salary.salaryAmount != null && salary.salaryAmount !== '') {
    return String(salary.salaryAmount);
  }
  return empty;
}
