import { useCreate } from '@/hooks/base/create';
import { toast } from 'react-toastify';
import { IBranch } from '../types';

export const useCreateBranch = () => {
  const { mutate: createBranchMutate, isPending: isCreateBranchPending } = useCreate<
    IBranch,
    Error,
    IBranch
  >({
    endPoint: '/api/branches',
    queryKey: ['branches'],
    onSuccess: () => {
      toast.success('تم إضافة الفرع');
    },
  });

  return { createBranchMutate, isCreateBranchPending };
};
