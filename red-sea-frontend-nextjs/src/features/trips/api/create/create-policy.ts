import { useTranslations } from 'next-intl';

import { useCreate } from '@/hooks/base/create';
import { ITripPolicyInfo } from '../../types/policy';

export const useCreateTripPolicy = () => {
  const t = useTranslations('common');

  const { mutate: createTripPolicyMutation, isPending: isCreateTripPolicyPending } = useCreate<
    ITripPolicyInfo,
    Error,
    ITripPolicyInfo
  >({
    endPoint: '/api/journey-policies',
    queryKey: ['journey-policies'],
  });

  return {
    createTripPolicyMutation,
    isCreateTripPolicyPending,
  };
};
