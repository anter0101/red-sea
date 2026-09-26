import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteCustody = () => {
  const t = useTranslations('custody');
  const { mutate: deleteCustodyMutation, isPending: isDeleteCustodyPending } = useDelete<
    unknown,
    Error
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.deleted')),
  });
  return { deleteCustodyMutation, isDeleteCustodyPending };
};
