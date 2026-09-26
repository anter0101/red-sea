'use client';

import { useRouter } from 'next/navigation';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllProducts } from '../api/get-all';
import { mapWarehouseRow, warehouseExportColumns } from '../export.config';

import ProductsTable from './table';

export default function WarehouseClientPage() {
  const router = useRouter();
  const params = usePaginationParams();
  const { products, totalProductsCount } = useGetAllProducts(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/warehouses',
    params,
    columns: warehouseExportColumns(),
    mapRow: mapWarehouseRow,
    fileName: 'warehouse',
  });

  return (
    <div className=" flex flex-col gap-4">
      <EntitiesToolbar
        onAdd={() => router.push('/warehouse/create')}
        onExport={exportData}
        isExporting={isExporting}
      />
      <TableFilters />
      <ProductsTable data={products ?? []} />
      <TablePagination totalCount={totalProductsCount} />
    </div>
  );
}
