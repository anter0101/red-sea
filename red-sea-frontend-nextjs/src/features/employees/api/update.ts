import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { IEmployee } from '@/features/employees/types';
import { usePut } from '@/hooks/base/update';

export const useUpdateEmployee = () => {
  const t = useTranslations('common');

  const { mutate: updateEmployeeMutation, isPending: isUpdateEmployeePending } = usePut<
    IEmployee,
    Error,
    IEmployee
  >({
    endPoint: `api/employees`,
    queryKey: ['employees'],
    onSuccess: () => {
      toast.success(t('actions.employee-updated-successfully'));
    },
  });

  return {
    updateEmployeeMutation,
    isUpdateEmployeePending,
  };
};
