import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { ISalary } from '@/types/salary/index';
import type { ICreateSalaryRequest } from '@/types/salary/mutation-request';

export const useCreateSalary = () => {
  const t = useTranslations('common');

  const { mutate: createSalaryMutation, isPending: isCreateSalaryPending } = useCreate<
    ISalary,
    Error,
    ICreateSalaryRequest
  >({
    endPoint: 'api/salaries',
    queryKey: ['salaries'],
    onSuccess: () => {
      toast.success(t('actions.salary-created-successfully'));
    },
  });
  return { createSalaryMutation, isCreateSalaryPending };
};
