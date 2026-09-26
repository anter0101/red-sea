import { useGetPaginated } from '@/hooks/base/get-paginated';
import { IQueryParams } from '@/types';

import { ProductStatus } from '../types/products';

export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.NEW]: 'جديد',
  [ProductStatus.AVAILABLE]: 'متاح',
  [ProductStatus.OUT_OF_STOCK]: 'نفذ من المخزون',
  [ProductStatus.PENDING]: 'قيد الانتظار',
  [ProductStatus.RESERVED]: 'محجوز',
  [ProductStatus.DISCONTINUED]: 'تم إيقاف المنتج',
};

export interface IWarehouseTableRow {
  id: number;
  productCode: string;
  name: string;
  category: string;
  industryType: string;
  status: string;
  condition: string;
  unit: string;
  quantity: number;
  alertQuantity: number;
  supplierName: string;
  unitPrice: number;
  purchaseDate: string;
  expiryDate: string;
  createdAt: string;
  lastUsedDate: string;
}

export function mapWarehouseRow(product: any): IWarehouseTableRow {
  const statusKey = product.status as ProductStatus | undefined;
  return {
    id: product.id,
    productCode: product.code ?? String(product.id),
    name: product.name ?? '-',
    category: product.category ?? '-',
    industryType: product.category ?? '-',
    status: (statusKey && ProductStatusLabels[statusKey]) || product.status || '-',
    condition: product.condition ?? '-',
    unit: product.unit ?? '-',
    quantity: product.quantity ?? 0,
    alertQuantity: product.alertQuantity ?? 0,
    supplierName: product.supplier?.name ?? '-',
    unitPrice: product.unitPrice ?? 0,
    purchaseDate: product.purchaseDate ?? '-',
    expiryDate: product.expiryDate ?? '-',
    createdAt: product.createdAt ?? '-',
    lastUsedDate: product.lastUsedDate ?? '-',
  };
}

export const useGetAllProducts = (params?: IQueryParams) => {
  const { data, isPending, error } = useGetPaginated<any>({
    endPoint: `/api/warehouses`,
    queryKey: ['api', 'warehouses'],
    params,
  });

  const products: IWarehouseTableRow[] = data?.data?.map(mapWarehouseRow) ?? [];

  return {
    products,
    isPending,
    totalProductsCount: data?.totalCount ?? 0,
    error,
  };
};
