import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteTrailerManufacturer = () => {
  const t = useTranslations('common');

  const {
    mutate: deleteTrailerManufacturerMutation,
    isPending: isDeleteTrailerManufacturerPending,
  } = useDelete({
    endPoint: 'api/trailer-manufacturers',
    queryKey: ['trailer-manufacturers'],
    onSuccess: () => {
      toast.success(t('actions.trailer-manufacturer-deleted-successfully'));
    },
  });

  return {
    deleteTrailerManufacturerMutation,
    isDeleteTrailerManufacturerPending,
  };
};
