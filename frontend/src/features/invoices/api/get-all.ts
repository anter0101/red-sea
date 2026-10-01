import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';
import type { InvoiceView } from '../types';

export const useGetAllInvoices = (params?: IQueryParams) => {
  const { data, isPending } = useGetPaginated<InvoiceView>({
    endPoint: '/api/invoices',
    queryKey: ['invoices'],
    params,
  });

  return {
    invoices: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    isPending,
  };
};
