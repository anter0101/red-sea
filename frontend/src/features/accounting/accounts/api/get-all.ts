import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { AccountType, NormalBalance } from '../enums';

export interface IAccountQueryParams extends IQueryParams {
  /** `null` = root list (sent as query `parentAccountId=null`). Number = direct children of that account. */
  parentAccountId?: number | null;
  isLeaf?: boolean;
  /** Filter by account type */
  type?: AccountType;
  /** Include parentAccount object in each item of the list response */
  includeParent?: boolean;
  /** Filter by creation date (from) — ISO 8601 */
  createdAtFrom?: string;
  /** Filter by creation date (to) — ISO 8601 */
  createdAtTo?: string;
}

type IAccountListRequestParams = Omit<IAccountQueryParams, 'parentAccountId'> & {
  parentAccountId?: number | string;
};

/** Axios omits `null` query params; backend expects `parentAccountId=null` for roots. */
export function serializeAccountListParams(
  params?: IAccountQueryParams,
): IAccountListRequestParams | undefined {
  if (!params) return undefined;
  const { parentAccountId, ...rest } = params;
  if (parentAccountId === null) {
    return { ...rest, parentAccountId: 'null' };
  }
  if (typeof parentAccountId === 'number') {
    return { ...rest, parentAccountId };
  }
  return { ...rest };
}

export interface IAccountResponse {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  isLeaf: boolean;
  isSystem: boolean;
  openingBalance?: number;
  openingBalanceLocked?: boolean;
  parentAccount?: {
    id: number;
    code: string;
    name: string;
  };
  childAccounts?: {
    id: number;
    code: string;
    name: string;
    type: AccountType;
    normalBalance: NormalBalance;
    isLeaf: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IAccountTableRow {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  isLeaf: boolean;
  parentAccountId: number | null;
  parentAccountName: string;
  openingBalance?: number;
}

export function mapAccountRow(account: IAccountResponse): IAccountTableRow {
  return {
    id: account.id,
    code: account.code,
    name: account.name,
    type: account.type,
    normalBalance: account.normalBalance,
    isLeaf: account.isLeaf,
    parentAccountId: account.parentAccount?.id ?? null,
    parentAccountName: account.parentAccount?.name || '—',
    openingBalance: account.openingBalance,
  };
}

export const useGetAllAccounts = (
  params?: IAccountQueryParams,
  options?: { enabled?: boolean },
) => {
  const serializedParams = serializeAccountListParams(params);
  const { data, isPending: isGetAccountsPending } = useGetPaginated<
    IAccountResponse,
    IAccountListRequestParams
  >({
    endPoint: '/api/accounting/accounts',
    queryKey: ['accounting-accounts'],
    params: serializedParams,
    enabled: options?.enabled ?? true,
  });

  const accounts: IAccountTableRow[] = data?.data?.map(mapAccountRow) ?? [];
  const totalAccountsCount = data?.totalCount ?? 0;

  return {
    accounts,
    isGetAccountsPending,
    totalAccountsCount,
  };
};
