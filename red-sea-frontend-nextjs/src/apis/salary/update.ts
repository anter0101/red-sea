import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import type { ISalary } from '@/types/salary';
import type { ICreateSalaryRequest } from '@/types/salary/mutation-request';

export const useUpdateSalary = () => {
  const t = useTranslations('common');

  const { mutate: updateSalaryMutation, isPending: isUpdateSalaryPending } = usePut<
    ISalary,
    Error,
    ICreateSalaryRequest
  >({
    endPoint: `api/salaries`,
    queryKey: ['salaries'],
    onSuccess: () => {
      toast.success(t('actions.salary-updated-successfully'));
    },
  });

  return {
    updateSalaryMutation,
    isUpdateSalaryPending,
  };
};
