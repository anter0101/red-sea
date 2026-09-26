import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteCarManufacturer = () => {
  const t = useTranslations('common');

  const { mutate: deleteCarManufacturerMutation, isPending: isDeleteCarManufacturerPending } =
    useDelete({
      endPoint: 'api/car-manufacturers',
      queryKey: ['car-manufacturers'],
      onSuccess: () => {
        toast.success(t('actions.car-manufacturer-deleted-successfully'));
      },
    });

  return { deleteCarManufacturerMutation, isDeleteCarManufacturerPending };
};
