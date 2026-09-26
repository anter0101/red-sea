import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteOfficeRequest = () => {
  const t = useTranslations('officeRequests');
  const { mutate: deleteOfficeRequestMutation, isPending: isDeleteOfficeRequestPending } =
    useDelete<unknown, Error>({
      endPoint: 'api/office-requests',
      queryKey: ['office-requests'],
      onSuccess: () => toast.success(t('actions.deleted')),
    });
  return { deleteOfficeRequestMutation, isDeleteOfficeRequestPending };
};
