import { useTranslations } from 'next-intl';

import { usePut } from '@/hooks/base/update';
import { ITrip } from '../../types';
import { ITripResponse } from '../../types/journey';

export const useEditTripDelegate = () => {
  const t = useTranslations('common');

  const { mutate: editTripDelegateMutation, isPending: isEditTripDelegateLoading } = usePut<
    ITrip,
    Error,
    ITripResponse
  >({
    endPoint: `/api/journeys`,
    queryKey: ['api', 'journeys'],
  });

  return {
    editTripDelegateMutation,
    isEditTripDelegateLoading,
  };
};
