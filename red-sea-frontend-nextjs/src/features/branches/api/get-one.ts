import { useGetOne } from '@/hooks/base/get-one';
import { IBranch } from '../types';

export const useGetOneBranch = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<IBranch, Error>({
    endPoint: `/api/branches/${id}`,
    queryKey: ['branches', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { branch: data, isGetBranchPending: isPending, error };
};
