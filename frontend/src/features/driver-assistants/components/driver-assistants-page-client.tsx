'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { UserRoles } from '@/enums/users/user-roles';
import { useGetAllDriverAssistants } from '@/features/driver-assistants/api/get-all';
import { useGetDriverAssistantStats } from '@/features/driver-assistants/api/get-assistant-stats';
import {
  driverAssistantsExportColumns,
  mapDriverAssistantRow,
} from '@/features/driver-assistants/export.config';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import DriverAssistantsTable from './driver-assistants-table';

export default function DriverAssistantsPageClient() {
  const router = useRouter();
  const tStatus = useTranslations('common.statuses');
  const params = usePaginationParams();
  const { driverAssistants, isGetDriverAssistantsPending, totalDriverAssistantsCount } =
    useGetAllDriverAssistants(params);
  const { data: stats, isPending: isStatsPending } = useGetDriverAssistantStats();
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/users',
    params: { ...params, role: UserRoles.DRIVER_ASSISTANT },
    columns: driverAssistantsExportColumns(tStatus),
    mapRow: mapDriverAssistantRow,
    fileName: 'driver-assistants',
  });

  return (
    <main>
      <div className="pageContainer">
        <div className="flex gap-2">
          <ReusableCard
            data={{
              title: 'إجمالي',
              value: isStatsPending ? '...' : (stats?.total ?? totalDriverAssistantsCount),
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
              title: 'المتاحين',
              value: isStatsPending ? '...' : (stats?.available ?? 0),
            }}
            color="primary"
          />
        </div>

        <EntitiesToolbar
          onAdd={() => router.push('/driver-assistants/create')}
          onExport={exportData}
          isExporting={isExporting}
        />
        <TableFilters />

        {isGetDriverAssistantsPending ? (
          <p className="text-center p-4">جاري التحميل...</p>
        ) : (
          <>
            <DriverAssistantsTable data={driverAssistants ?? []} />
            <TablePagination totalCount={totalDriverAssistantsCount} />
          </>
        )}
      </div>
    </main>
  );
}
