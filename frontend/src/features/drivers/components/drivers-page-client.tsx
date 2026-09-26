'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetDriverStats } from '@/features/drivers/api/get-driver-stats';
import DriversTable from '@/features/drivers/components/drivers-table';
import { driversExportColumns, mapDriverRow } from '@/features/drivers/export.config';
import { useTableExport } from '@/hooks/use-table-export';
import { usePaginationParams } from '@/hooks/use-pagination-params';

export default function DriversPageClient() {
  const router = useRouter();
  const tStatus = useTranslations('common.statuses');
  const params = usePaginationParams();
  const { drivers, isGetDriversPending, totalDriversCount } = useGetAllDrivers(params);
  const { data: stats, isPending: isStatsPending } = useGetDriverStats();
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/drivers',
    params,
    columns: driversExportColumns(tStatus),
    mapRow: mapDriverRow,
    fileName: 'drivers',
  });

  return (
    <main>
      <div className="pageContainer">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ReusableCard
            data={{
              title: 'اجمالى السواقين',
              value: isStatsPending ? '...' : (stats?.total ?? totalDriversCount),
            }}
            color="primary"
          />
          <ReusableCard
            data={{
              title: 'على الطريق',
              value: isStatsPending ? '...' : (stats?.onRoad ?? 0),
            }}
            color="secondary"
          />
          <ReusableCard
            data={{
              title: 'السائقين المتاحين',
              value: isStatsPending ? '...' : (stats?.available ?? 0),
            }}
            color="primary"
          />
        </div>

        <EntitiesToolbar
          onAdd={() => router.push('/drivers/create')}
          onExport={exportData}
          isExporting={isExporting}
        />
        <TableFilters />

        {isGetDriversPending ? (
          <p className="text-center p-4">جاري التحميل...</p>
        ) : (
          <>
            <DriversTable data={drivers ?? []} />
            <TablePagination totalCount={totalDriversCount} />
          </>
        )}
      </div>
    </main>
  );
}
