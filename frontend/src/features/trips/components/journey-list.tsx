'use client';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { DataTable } from '@/components/main-table/data-table';
import { columns, TripRow } from '@/components/main-table/columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';
import { createQueryString } from '@/lib/utils';
import { usePageKey } from '@/utils/use-page-key';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGetAllJourneys } from '../api/get-all/get-all-journeys';
import { useGetJourneyStats } from '../api/get-journey-stats';
import { mapTripRow, tripsExportColumns } from '../export.config';
import type { JourneyListScope } from '@/features/trips/types/journey-list-scope';
import { journeyScopeToParams } from '@/features/trips/types/journey-list-scope';
import { PrintJourneyButton } from './print-journey-button';

import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_OPTIONS,
} from '@/features/trips/constants/journey-status';

const TRIP_STATUS_OPTIONS = JOURNEY_STATUS_OPTIONS.map((option) => ({
  value: option.value,
  label: JOURNEY_STATUS_LABELS[option.value] ?? option.value,
}));

type JourneyListProps = {
  scope?: JourneyListScope;
  showStats?: boolean;
  showExport?: boolean;
  showPrintAction?: boolean;
  detailPathPrefix?: string;
};

function TripStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tripStatus = searchParams.get('tripStatus') ?? '';

  const onChange = (value: string) => {
    router.push(
      pathname +
        '?' +
        createQueryString(searchParams, {
          tripStatus: value === 'all' ? null : value,
          page: 1,
        }),
    );
  };

  return (
    <Select value={tripStatus || 'all'} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px] bg-white h-10">
        <SelectValue placeholder="حالة الرحلة" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">كل الحالات</SelectItem>
        {TRIP_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function JourneyList({
  scope,
  showStats = false,
  showExport = true,
  showPrintAction = false,
  detailPathPrefix = '/trips',
}: JourneyListProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const params = usePaginationParams();
  const scopeParams = journeyScopeToParams(scope);
  const listParams = { ...params, ...scopeParams };
  const statsParams = { ...listParams };

  const { journeys, isGetJourneysPending, totalJourneysCount } = useGetAllJourneys(
    listParams,
    scope,
  );
  const { data: stats, isPending: isStatsPending } = useGetJourneyStats(
    showStats ? statsParams : undefined,
  );

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/journeys',
    params: listParams,
    columns: tripsExportColumns(),
    mapRow: mapTripRow,
    fileName: scope?.driverId
      ? `driver-${scope.driverId}-trips`
      : scope?.driverAssistantId
        ? `assistant-${scope.driverAssistantId}-trips`
        : scope?.carId
          ? `car-${scope.carId}-trips`
          : scope?.trailerId
            ? `trailer-${scope.trailerId}-trips`
            : scope?.clientId
              ? `client-${scope.clientId}-trips`
              : scope?.branchId
                ? `branch-${scope.branchId}-trips`
                : 'trips',
  });

  const tableColumns = showPrintAction
    ? [
        ...columns,
        {
          header: 'الطباعة',
          accessorKey: 'id',
          cell: ({ row }: { row: { original: TripRow } }) => (
            <PrintJourneyButton journeyId={row.original.id} />
          ),
        },
      ]
    : columns;

  return (
    <div className="pageContainer">
      {showStats && (
        <div className="flex w-full flex-nowrap gap-2">
          <ReusableCard
            className="min-w-0 flex-1 w-auto"
            data={{
              title: 'إجمالي وزن الاسمنت المنقول :',
              value: isStatsPending ? '...' : String(Math.round(stats?.totalBookWeight ?? 0)),
            }}
            color="secondary"
          />
          <ReusableCard
            className="min-w-0 flex-1 w-auto"
            data={{
              title: 'إجمالي عدد الرحلات :',
              value: isStatsPending ? '...' : String(stats?.journeyCount ?? totalJourneysCount),
            }}
            color="primary"
          />
          <ReusableCard
            className="min-w-0 flex-1 w-auto"
            data={{
              title: 'إجمالي المسافة المقطوعة :',
              value: isStatsPending ? '...' : String(Math.round(stats?.totalDistance ?? 0)),
            }}
            color="secondary"
          />
          {(scope?.driverId != null || scope?.driverAssistantId != null) && (
            <ReusableCard
              className="min-w-0 flex-1 w-auto"
              data={{
                title: 'أيام العمل :',
                value: isStatsPending ? '...' : String(stats?.workingDays ?? 0),
              }}
              color="primary"
            />
          )}
        </div>
      )}

      {showExport && <EntitiesToolbar onExport={exportData} isExporting={isExporting} />}

      <TableFilters>
        <TripStatusFilter />
      </TableFilters>

      {isGetJourneysPending ? (
        <p className="text-center p-4">جاري التحميل...</p>
      ) : (
        <>
          <DataTable<TripRow, unknown>
            columns={tableColumns}
            data={journeys as TripRow[]}
            pageKey={pageKey}
            onRowDoubleClick={(row) => router.push(`${detailPathPrefix}/${row.id}`)}
          />
          <TablePagination totalCount={totalJourneysCount} />
        </>
      )}
    </div>
  );
}
