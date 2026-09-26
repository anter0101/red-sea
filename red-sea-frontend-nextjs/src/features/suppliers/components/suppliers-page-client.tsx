'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import Loader from '@/components/common/loader';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { useGetAllSuppliers } from '@/features/suppliers/api/get-all';
import SupplierTable from '@/features/suppliers/components/supplier-table';
import { mapSupplierRow, suppliersExportColumns } from '@/features/suppliers/export.config';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

export default function SuppliersPageClient() {
  const router = useRouter();
  const t = useTranslations('suppliers');
  const headers = useTranslations('suppliers.table.headers');
  const params = usePaginationParams();
  const { suppliers, isGetSuppliersPending, totalSuppliersCount } = useGetAllSuppliers(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/suppliers',
    params,
    columns: suppliersExportColumns(headers, (type) => t(`types.${type}`)),
    mapRow: mapSupplierRow,
    fileName: 'suppliers',
  });

  return (
    <div className="flex flex-col gap-4">
      <EntitiesToolbar
        onAdd={() => router.push('/suppliers/create')}
        onExport={exportData}
        isExporting={isExporting}
      />
      <TableFilters />
      {isGetSuppliersPending ? (
        <Loader />
      ) : (
        <>
          <SupplierTable suppliers={suppliers} />
          <TablePagination totalCount={totalSuppliersCount} />
        </>
      )}
    </div>
  );
}
