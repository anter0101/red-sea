'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Loader from '@/components/common/loader';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import EntitiesToolbar from '@/components/common/entities-toolbar';
import { useGetAllPartners } from '@/features/partners/api/get-all';
import PartnersTable from '@/features/partners/components/table';
import { mapPartnerRow, partnersExportColumns } from '@/features/partners/export.config';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

export default function PartnersClientPage() {
  const router = useRouter();
  const headers = useTranslations('partners.table.headers');
  const params = usePaginationParams();
  const { partners, isGetPartnersPending, totalPartnersCount } = useGetAllPartners(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/owners',
    params: { ...params, search: params.search ?? '' },
    columns: partnersExportColumns(headers),
    mapRow: mapPartnerRow,
    fileName: 'partners',
  });

  const handleAddPartner = () => {
    router.push('/partners/create');
  };

  return (
    <div className="flex flex-col gap-4">
      <EntitiesToolbar
        onAdd={handleAddPartner}
        onExport={exportData}
        isExporting={isExporting}
      />
      <TableFilters />
      {isGetPartnersPending ? (
        <Loader />
      ) : (
        <>
          <PartnersTable partners={partners} />
          <TablePagination totalCount={totalPartnersCount} />
        </>
      )}
    </div>
  );
}
