import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteDriver = () => {
  const t = useTranslations('common');

  const { mutate: deleteDriverMutation, isPending: isDeleteDriverPending } = useDelete({
    endPoint: 'api/drivers',
    queryKey: ['drivers'],
    onSuccess: () => {
      toast.success(t('message.driver-deleted-successfully'));
    },
  });
  return { deleteDriverMutation, isDeleteDriverPending };
};
