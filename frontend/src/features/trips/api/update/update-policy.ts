import { useTranslations } from 'next-intl';

import { usePut } from '@/hooks/base/update';
import { ITripPolicyInfo, ITripPolicyRes } from '../../types/policy';

export const useEditTripPolicy = (policyId?: string | number) => {
  const t = useTranslations('common');

  const { mutate: editTripPolicyMutation, isPending: isEditTripPolicyLoading } = usePut<
    ITripPolicyInfo,
    Error,
    ITripPolicyRes
  >({
    endPoint: `/api/journey-policies/journey/${policyId}`,
    queryKey: ['journey-policies'],
    enabled: !!policyId,
  });

  return {
    editTripPolicyMutation,
    isEditTripPolicyLoading,
  };
};
