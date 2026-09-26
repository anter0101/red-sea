import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteEmployee = () => {
  const t = useTranslations('common');

  const { mutate: deleteEmployeeMutation, isPending: isDeleteEmployeePending } = useDelete({
    endPoint: 'api/employees',
    queryKey: ['employees'],
    onSuccess: () => {
      toast.success(t('message.employee-deleted-successfully'));
    },
  });
  return { deleteEmployeeMutation, isDeleteEmployeePending };
};
