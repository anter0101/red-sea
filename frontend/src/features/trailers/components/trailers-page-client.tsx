'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllTrailers } from '../api/get-all';
import { useGetTrailerStats } from '../api/get-trailer-stats';
import { mapTrailerRow, trailersExportColumns } from '../export.config';

import TrailersTable from './trailers-table';

export default function TrailersPageClient() {
  const router = useRouter();
  const tStatus = useTranslations('common.statuses');
  const tTrailers = useTranslations('trailers');
  const params = usePaginationParams();
  const { trailers, isGetTrailersPending, totalTrailersCount } = useGetAllTrailers(params);
  const { data: stats, isPending: isStatsPending } = useGetTrailerStats();
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/trailers',
    params,
    columns: trailersExportColumns(tStatus, (key) => tTrailers(`ownership.types.${key}`)),
    mapRow: mapTrailerRow,
    fileName: 'trailers',
  });

  return (
    <div className="pageContainer">
      <div className="flex gap-2">
        <ReusableCard
          data={{
            title: 'مقطورات علي الطريق ',
            value: isStatsPending ? '...' : (stats?.onRoad ?? 0),
          }}
          color="primary"
        />
        <ReusableCard
          data={{
            title: 'مقطورات الشركة',
            value: isStatsPending ? '...' : (stats?.company ?? 0),
          }}
          color="secondary"
        />
        <ReusableCard
          data={{
            title: 'مقطورات المشتركة',
            value: isStatsPending ? '...' : (stats?.share ?? 0),
          }}
          color="primary"
        />
        <ReusableCard
          data={{
            title: 'مقطورات مؤجرة',
            value: isStatsPending ? '...' : (stats?.nolon ?? 0),
          }}
          color="primary"
        />
      </div>
      <EntitiesToolbar
        onAdd={() => router.push('/trailers/create')}
        onExport={exportData}
        isExporting={isExporting}
      />
      <TableFilters />
      {isGetTrailersPending ? (
        <p className="text-center p-4">جاري التحميل...</p>
      ) : (
        <>
          <TrailersTable data={trailers ?? []} />
          <TablePagination totalCount={totalTrailersCount} />
        </>
      )}
    </div>
  );
}
