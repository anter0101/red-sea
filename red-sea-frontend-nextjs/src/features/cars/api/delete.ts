import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteCar = () => {
  const t = useTranslations('common');

  const { mutate: deleteCarMutation, isPending: isDeleteCarPending } = useDelete({
    endPoint: 'api/cars',
    queryKey: ['cars'],
    onSuccess: () => {
      toast.success(t('message.driver-deleted-successfully'));
    },
  });

  return { deleteCarMutation, isDeleteCarPending };
};
