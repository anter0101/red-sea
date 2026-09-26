import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import type { IDriver } from '@/features/drivers/types';
import { usePut } from '@/hooks/base/update';

export const useEditDrivers = () => {
  const t = useTranslations('common');

  const { mutate: editDriversMutation, isPending: isEditDriversLoading } = usePut<
    IDriver,
    Error,
    IDriver
  >({
    endPoint: `api/drivers`,
    queryKey: ['drivers'],
    onSuccess: () => {
      toast.success(t('actions.driver-updated-successfully'));
    },
  });

  return {
    editDriversMutation,
    isEditDriversLoading,
  };
};
