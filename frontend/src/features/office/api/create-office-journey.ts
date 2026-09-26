import axios from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { CreateOfficeJourneyPayload } from '../types/office-journey-schema';

export interface OfficeJourneyResponse {
  id: number;
  delegateNumber?: string;
}

export const useCreateOfficeJourney = () => {
  const t = useTranslations('office');
  const { mutate: createOfficeJourneyMutation, isPending: isCreateOfficeJourneyPending } =
    useCreate<OfficeJourneyResponse, Error, CreateOfficeJourneyPayload>({
      endPoint: 'api/journeys/office',
      queryKey: ['journeys'],
      onSuccess: (data) => {
        if (data?.delegateNumber) {
          toast.success(
            `${t('form.created')} — ${t('form.delegateNumber')}: ${data.delegateNumber}`,
          );
        } else {
          toast.success(t('form.created'));
        }
      },
      onError: (error) => {
        const message = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : String(error);
        toast.error(message);
      },
    });

  return { createOfficeJourneyMutation, isCreateOfficeJourneyPending };
};
