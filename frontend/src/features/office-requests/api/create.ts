import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { IOfficeRequestResponse, OfficeRequestBody } from '../types';

export const useCreateOfficeRequest = () => {
  const t = useTranslations('officeRequests');
  const { mutate: createOfficeRequestMutation, isPending: isCreateOfficeRequestPending } =
    useCreate<IOfficeRequestResponse, Error, OfficeRequestBody>({
      endPoint: 'api/office-requests',
      queryKey: ['office-requests'],
      onSuccess: () => toast.success(t('actions.created')),
    });
  return { createOfficeRequestMutation, isCreateOfficeRequestPending };
};
