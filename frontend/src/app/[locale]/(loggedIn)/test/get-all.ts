import type { TransactionType } from '@/enums/transaction-type';
import type { ITrailerOwnership } from '@/types/trailers/trailer';
import { useGetAll } from '@/hooks/base/get-all';
import type { IAuditFields } from '@/types/audit-fields';

interface ICarOwnership {
  id?: number;
  percentage?: string;
  contractUrl?: string;
  notes?: string;
  car?: {
    id?: number;
    code?: string;
    manufactureYear?: number;
    manufacturer?: string;
    model?: string;
    plateNumber?: string;
  };
}

interface IOwner extends IAuditFields {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  transactionType?: TransactionType;
  trailerOwnerships?: ITrailerOwnership[];
  carOwnerships?: ICarOwnership[];
}

interface GetOwnersParams {
  pageSize?: number;
  sortOrder?: 'ASC' | 'DESC';
}

export default function useGetOwners(params?: GetOwnersParams) {
  const {
    data,
    isPending: isGetOwnersPending,
    hasNextPage: hasNextOwnerPage,
    isFetchingNextPage: isGetOwnersFetchingNextPage,
    fetchNextPage: fetchNextOwnerPage,
  } = useGetAll({
    endPoint: '/api/owners',
    queryKey: ['owners'],
    pagination: {
      pageSize: params?.pageSize,
      sortOrder: params?.sortOrder,
    },
  });

  const owners: IOwner[] = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    owners,
    isGetOwnersPending,
    hasNextOwnerPage,
    isGetOwnersFetchingNextPage,
    fetchNextOwnerPage,
  };
}
