import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import { IBranch } from '../types';

export const useEditBranch = () => {
  const t = useTranslations('common');

  const { mutate: editBranchMutation, isPending: isEditBranchLoading } = usePut<
    IBranch,
    Error,
    IBranch
  >({
    endPoint: `/api/branches`,
    queryKey: ['branches'],
    onSuccess: () => {
      toast.success('تم تعديل الفرع بنجاح');
    },
  });

  return {
    editBranchMutation,
    isEditBranchLoading,
  };
};
