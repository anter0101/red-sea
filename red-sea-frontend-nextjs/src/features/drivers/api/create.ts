import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { IDriver } from '@/features/drivers/types';
import { useCreate } from '@/hooks/base/create';

export const useCreateDriver = () => {
  const t = useTranslations('common');
  const { mutate: createDriverMutation, isPending: isCreateDriverPending } = useCreate<
    IDriver,
    Error,
    IDriver
  >({
    endPoint: 'api/drivers',
    queryKey: ['drivers'],
    onSuccess: () => {
      toast.success(t('actions.driver-created-successfully'));
    },
  });
  return { createDriverMutation, isCreateDriverPending };
};
