import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import { ITrip } from '../../types';
import { ITripResponse } from '../../types/journey';

export const useCreateTripDelegate = () => {
  const t = useTranslations('common');

  const { mutate: createTripDelegateMutation, isPending: isCreateTripDelegatePending } = useCreate<
    ITrip,
    Error,
    ITripResponse
  >({
    endPoint: '/api/journeys',
    queryKey: ['api', 'journeys'],
  });

  return {
    createTripDelegateMutation,
    isCreateTripDelegatePending,
  };
};
