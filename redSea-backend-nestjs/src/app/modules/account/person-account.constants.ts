import { UserRole } from 'src/core/enums/user-role';

export const ACCOUNT_PARENT_CUSTODY = 'عهد';
export const ACCOUNT_PARENT_LOAN = 'سلف';
export const ACCOUNT_PARENT_SALARIES = 'رواتب';

export const PERSON_ACCOUNT_PARENTS: Partial<Record<UserRole, string[]>> = {
  [UserRole.DRIVER]: [ACCOUNT_PARENT_CUSTODY, ACCOUNT_PARENT_SALARIES],
  [UserRole.DRIVER_ASSISTANT]: [ACCOUNT_PARENT_SALARIES],
  [UserRole.DATA_ENTRY]: [ACCOUNT_PARENT_CUSTODY, ACCOUNT_PARENT_LOAN, ACCOUNT_PARENT_SALARIES],
};

export function buildPersonAccountName(
  firstName?: string | null,
  lastName?: string | null,
  fallbackLabel?: string,
): string {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return name || fallbackLabel || '';
}
