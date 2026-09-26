import { useDelete } from '@/hooks/base/delete';
import { toast } from 'react-toastify';

export const useDeleteBranch = () => {
  const { mutate: deleteBranchMutation, isPending: isDeleteBranchPending } = useDelete({
    endPoint: '/api/branches',
    queryKey: ['branches'],
    onSuccess: () => {
      toast.success('تم حذف الفرع');
    },
  });

  return { deleteBranchMutation, isDeleteBranchPending };
};
