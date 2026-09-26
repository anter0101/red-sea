import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { IEmployee } from '@/features/employees/types';
import { useCreate } from '@/hooks/base/create';

export const useCreateEmployee = () => {
  const t = useTranslations('common');
  const { mutate: createEmployeeMutation, isPending: isCreateEmployeePending } = useCreate<
    IEmployee,
    Error,
    IEmployee
  >({
    endPoint: 'api/employees',
    queryKey: ['employees'],
    onSuccess: () => {
      toast.success(t('actions.employee-created-successfully'));
    },
  });
  return { createEmployeeMutation, isCreateEmployeePending };
};
