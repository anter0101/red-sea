'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import type { TripRow } from '@/components/main-table/columns';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';
import type { ExportColumnDef } from '@/lib/export';
import { createQueryString } from '@/lib/utils';
import { usePageKey } from '@/utils/use-page-key';
import { useGetAllJourneys } from '@/features/trips/api/get-all/get-all-journeys';
import {
  JOURNEY_STATUS_COLORS,
  JOURNEY_STATUS_TEXT_COLORS,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_OPTIONS,
} from '@/features/trips/constants/journey-status';
import { mapTripRow } from '@/features/trips/export.config';

const POLICY_STATUSES = ['DELEGATION_ISSUED', 'POLICY_COLLECTED'] as const;

const POLICY_STATUS_OPTIONS = JOURNEY_STATUS_OPTIONS.filter((option) =>
  POLICY_STATUSES.includes(option.value as (typeof POLICY_STATUSES)[number]),
).map((option) => ({
  value: option.value,
  label: JOURNEY_STATUS_LABELS[option.value] ?? option.value,
}));

function formatDay(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ar-EG');
}

const POLICY_EXPORT_COLUMNS: ExportColumnDef<TripRow>[] = [
  { key: 'delegateNumber', header: 'رقم التفويض' },
  {
    key: 'delegateDate',
    header: 'تاريخ التفويض',
    format: (value) => formatDay(value == null ? undefined : String(value)),
  },
  { key: 'driverName', header: 'السائق' },
  {
    key: 'tripStatus',
    header: 'الحالة',
    format: (value) => JOURNEY_STATUS_LABELS[String(value)] ?? String(value ?? '-'),
  },
];

function policyColumns(onOpen: (journeyId: number) => void): ColumnDef<TripRow>[] {
  return [
    {
      id: 'delegateNumber',
      accessorKey: 'delegateNumber',
      header: 'رقم التفويض',
      cell: ({ row }) => row.original.delegateNumber || '-',
    },
    {
      id: 'delegateDate',
      accessorKey: 'delegateDate',
      header: 'تاريخ التفويض',
      cell: ({ row }) => formatDay(row.original.delegateDate),
    },
    {
      id: 'driverName',
      accessorKey: 'driverName',
      header: 'السائق',
      cell: ({ row }) => row.original.driverName || '-',
    },
    {
      id: 'tripStatus',
      accessorKey: 'tripStatus',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.tripStatus;
        return (
          <Badge
            className="px-4 py-1"
            style={{
              backgroundColor: JOURNEY_STATUS_COLORS[status] ?? '#EEE',
              color: JOURNEY_STATUS_TEXT_COLORS[status] ?? '#111827',
            }}
          >
            {JOURNEY_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'إجراء',
      cell: ({ row }) => (
        <Button type="button" size="sm" onClick={() => onOpen(row.original.id)}>
          بوليصه
        </Button>
      ),
    },
  ];
}

function PolicyStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tripStatus = searchParams.get('tripStatus') ?? '';
  const selected = POLICY_STATUSES.includes(tripStatus as (typeof POLICY_STATUSES)[number])
    ? tripStatus
    : 'all';

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
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full bg-white sm:w-[180px]">
        <SelectValue placeholder="حالة الرحلة" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">كل الحالات</SelectItem>
        {POLICY_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function OfficePolicyList() {
  const router = useRouter();
  const pageKey = usePageKey();
  const openPolicy = (journeyId: number) => router.push(`/office/policy/${journeyId}`);
  const tableColumns = useMemo(() => policyColumns(openPolicy), [router]);
  const params = usePaginationParams();
  const selectedStatus = POLICY_STATUSES.includes(
    params.tripStatus as (typeof POLICY_STATUSES)[number],
  )
    ? params.tripStatus
    : undefined;

  const listParams = {
    ...params,
    tripStatus: selectedStatus,
    tripStatuses: selectedStatus ? undefined : POLICY_STATUSES.join(','),
  };

  const { journeys, isGetJourneysPending, totalJourneysCount } = useGetAllJourneys(listParams);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/journeys',
    params: listParams,
    columns: POLICY_EXPORT_COLUMNS,
    mapRow: mapTripRow,
    fileName: 'office-policies',
  });

  return (
    <div className="pageContainer">
      <EntitiesToolbar onExport={exportData} isExporting={isExporting} />
      <TableFilters>
        <PolicyStatusFilter />
      </TableFilters>
      {isGetJourneysPending ? (
        <p className="p-4 text-center">جاري التحميل...</p>
      ) : (
        <>
          <DataTable<TripRow, unknown>
            columns={tableColumns}
            data={journeys as TripRow[]}
            pageKey={pageKey}
            onRowDoubleClick={(row) => openPolicy(row.id)}
          />
          <TablePagination totalCount={totalJourneysCount} />
        </>
      )}
    </div>
  );
}
