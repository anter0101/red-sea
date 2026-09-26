import type { IBranch } from '@/features/branches/types';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

interface BranchesQueryParams extends IQueryParams {
  // feature-specific params can be added here
}

export const useGetAllBranches = (params?: BranchesQueryParams) => {
  const { data, isPending: isGetBranchesPending } = useGetPaginated({
    endPoint: '/api/branches',
    queryKey: ['branches'],
    params,
  });

  const branches: IBranch[] =
    data?.data?.map((branch: any) => ({
      id: branch.id?.toString() ?? '',
      name: branch.name ?? '—',
      createdAt: branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('en-GB') : '—',
      addedBy: branch.createdBy ?? 'system',
    })) ?? [];

  const totalBranchesCount = data?.totalCount ?? 0;

  return { branches, isGetBranchesPending, totalBranchesCount };
};
