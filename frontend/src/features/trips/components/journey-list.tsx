'use client';

import { useEffect, useState } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { DataTable } from '@/components/main-table/data-table';
import { columns, TripRow } from '@/components/main-table/columns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllClients } from '@/features/clients/api/get-all';
import { CreateInvoiceDialog } from '@/features/invoices/components/create-invoice-dialog';
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
  enableInvoicing?: boolean;
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

function InvoiceClientSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') ?? '';
  const { clients, isGetClientsPending } = useGetAllClients({ page: 1, pageSize: 100 });

  const onChange = (value: string) => {
    router.push(
      pathname +
        '?' +
        createQueryString(searchParams, {
          clientId: value === 'none' ? null : value,
          page: 1,
        }),
    );
  };

  return (
    <Select value={clientId || 'none'} onValueChange={onChange} disabled={isGetClientsPending}>
      <SelectTrigger className="h-10 w-full bg-white sm:w-[240px]">
        <SelectValue placeholder="اختر العميل" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">اختر العميل</SelectItem>
        {clients.map((client) => (
          <SelectItem key={client.id} value={String(client.id)}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function InvoiceColorLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-sm bg-emerald-200" />
        مفوترة
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-sm bg-amber-200" />
        غير مفوترة
      </span>
    </div>
  );
}

function InvoicedFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const invoiced = searchParams.get('invoiced') ?? 'all';

  const onChange = (value: string) => {
    router.push(
      pathname +
        '?' +
        createQueryString(searchParams, {
          invoiced: value === 'all' ? null : value,
          page: 1,
        }),
    );
  };

  return (
    <Select value={invoiced} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full bg-white sm:w-[180px]">
        <SelectValue placeholder="الفوترة" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">كل الفوترة</SelectItem>
        <SelectItem value="false">غير مفوترة</SelectItem>
        <SelectItem value="true">مفوترة</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function JourneyList({
  scope,
  showStats = false,
  showExport = true,
  showPrintAction = false,
  enableInvoicing = false,
  detailPathPrefix = '/trips',
}: JourneyListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageKey = usePageKey();
  const params = usePaginationParams();
  const scopeParams = journeyScopeToParams(scope);
  const invoiced = searchParams.get('invoiced');
  const invoiceClientId = enableInvoicing ? Number(searchParams.get('clientId')) || undefined : undefined;
  const canInvoice = Boolean(invoiceClientId);
  const listParams = {
    ...params,
    ...scopeParams,
    ...(invoiceClientId ? { clientId: invoiceClientId } : {}),
    ...(enableInvoicing && invoiced === 'true' ? { invoiced: true } : {}),
    ...(enableInvoicing && invoiced === 'false' ? { invoiced: false } : {}),
  };
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const selectionKey = JSON.stringify(listParams);
  useEffect(() => {
    setRowSelection({});
  }, [selectionKey]);
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

  const baseColumns =
    enableInvoicing && canInvoice ? columns : columns.filter((column) => column.id !== 'select');
  const tableColumns = showPrintAction
    ? [
        ...baseColumns,
        {
          header: 'الطباعة',
          accessorKey: 'id',
          cell: ({ row }: { row: { original: TripRow } }) => (
            <PrintJourneyButton journeyId={row.original.id} />
          ),
        },
      ]
    : baseColumns;

  const rows = journeys as TripRow[];
  const selected = rows.filter((row) => rowSelection[String(row.id)]);

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

      {enableInvoicing && (
        <div className="flex flex-wrap items-center gap-4">
          <InvoiceClientSelect />
          <InvoiceColorLegend />
        </div>
      )}

      <TableFilters>
        <TripStatusFilter />
        {enableInvoicing && <InvoicedFilter />}
      </TableFilters>

      {canInvoice && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">{selected.length} رحلة محددة</span>
          <Button type="button" onClick={() => setInvoiceOpen(true)}>
            إنشاء فاتورة
          </Button>
        </div>
      )}

      {isGetJourneysPending ? (
        <p className="text-center p-4">جاري التحميل...</p>
      ) : (
        <>
          <DataTable<TripRow, unknown>
            columns={tableColumns}
            data={rows}
            pageKey={pageKey}
            onRowDoubleClick={(row) => router.push(`${detailPathPrefix}/${row.id}`)}
            enableRowSelection={
              canInvoice
                ? (row) =>
                    row.original.tripStatus === 'POLICY_COLLECTED' && !row.original.preliminaryInvoiceNo
                : undefined
            }
            rowSelection={canInvoice ? rowSelection : undefined}
            onRowSelectionChange={canInvoice ? setRowSelection : undefined}
            getRowId={canInvoice ? (row) => String(row.id) : undefined}
            getRowClassName={
              enableInvoicing
                ? (row) =>
                    row.original.preliminaryInvoiceNo
                      ? 'bg-emerald-50 hover:bg-emerald-100 data-[state=selected]:bg-emerald-100'
                      : 'bg-amber-50 hover:bg-amber-100 data-[state=selected]:bg-amber-100'
                : undefined
            }
          />
          {canInvoice && invoiceClientId && (
            <CreateInvoiceDialog
              open={invoiceOpen}
              onOpenChange={setInvoiceOpen}
              clientId={invoiceClientId}
              clientName={selected.find((row) => Number(row.clientId) === invoiceClientId)?.clientName}
              journeyIds={selected.map((row) => row.id)}
            />
          )}
          <TablePagination totalCount={totalJourneysCount} />
        </>
      )}
    </div>
  );
}
