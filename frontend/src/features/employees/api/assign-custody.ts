import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';

interface AssignCustodyInput {
  employeeId: number;
  amount: number;
}

export const useAssignEmployeeCustody = () => {
  const t = useTranslations('common');

  const { mutateAsync: assignCustodyMutation, isPending: isAssignCustodyPending } = useMutation({
    mutationFn: async ({ employeeId, amount }: AssignCustodyInput) => {
      const res = await client.post<{ message: string }>(
        `api/employees/${employeeId}/custody`,
        { amount },
      );
      return res.data;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('message.on-error')));
    },
  });

  return { assignCustodyMutation, isAssignCustodyPending };
};
