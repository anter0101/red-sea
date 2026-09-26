import { useGetOne } from '@/hooks/base/get-one';
import { IClient } from '../types';

function mapClientResponse(data: IClient | undefined): IClient | undefined {
  if (!data) return data;
  // BE uses taxInvoice; FE forms historically used taxCard — keep both in sync for UI.
  const taxValue = data.taxInvoice ?? data.taxCard;
  return {
    ...data,
    taxInvoice: taxValue,
    taxCard: taxValue,
  };
}

export const useGetOneClient = (id: number | null, enabled = true) => {
  const { data, isPending, error } = useGetOne<IClient, Error>({
    endPoint: `/api/clients/${id}`,
    queryKey: ['clients', ...(id ? [id.toString()] : [])],
    enabled,
  });
  return { client: mapClientResponse(data), isGetClientPending: isPending, error };
};
