import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import type { InvoiceView } from '../types';

export const useGetInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoices', id],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: async () => {
      const res = await client.get<InvoiceView>(`/api/invoices/${id}`);
      return res.data;
    },
  });
};
