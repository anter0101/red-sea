import type { IPartner } from '@/features/partners/types';
import { useGetOne } from '@/hooks/base/get-one';

export const useGetOnePartner = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<IPartner, Error>({
    endPoint: `/api/owners/${id}`,
    queryKey: ['owners', ...(id ? [id.toString()] : [])],
    enabled,
  });

  return { partner: data, isGetPartnerPending: isPending, error };
};
