import { useGetOne } from '@/hooks/base/get-one';
import { ITripPolicyRes } from '../../types/policy';

export const useGetOnePolicy = (journeyId: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<ITripPolicyRes, Error>({
    endPoint: `/api/journey-policies/journey/${journeyId}`,
    queryKey: ['journey-policies', ...(journeyId ? [journeyId.toString()] : [])],
    enabled,
  });

  return { policy: data, isGetPolicyPending: isPending, error };
};
