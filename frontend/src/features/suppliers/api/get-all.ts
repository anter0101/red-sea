import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { SupplierType } from '../enums/supplier-type';
import type { ISupplier } from '../types';

export interface ISupplierTableRow {
  id: number;
  code: string;
  name: string;
  type: SupplierType;
  governorate: string;
  phone: string;
}

export function mapSupplierRow(supplier: ISupplier): ISupplierTableRow {
  return {
    id: supplier.id as number,
    code: supplier.code ?? '-',
    name: supplier.name ?? '-',
    type: supplier.type!,
    governorate: supplier.government?.name ?? '-',
    phone: supplier.phone ?? '-',
  };
}

export const useGetAllSuppliers = (params?: IQueryParams) => {
  const { data, isPending: isGetSuppliersPending } = useGetPaginated<
    ISupplier,
    IQueryParams
  >({
    endPoint: '/api/suppliers',
    queryKey: ['suppliers'],
    params,
  });

  const suppliers: ISupplierTableRow[] = data?.data?.map(mapSupplierRow) ?? [];

  const totalSuppliersCount = data?.totalCount ?? 0;

  return {
    suppliers,
    isGetSuppliersPending,
    totalSuppliersCount,
  };
};
