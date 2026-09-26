'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { toOfficeRequestRow, useGetAllOfficeRequests } from '../api/get-all';
import { officeRequestsExportColumns } from '../export.config';
import { useRequestAction } from '../api/request-action';
import CustodyActionDialog from './custody-action-dialog';
import EndShiftActionDialog from './end-shift-action-dialog';
import OfficeRequestsTable from './office-requests-table';

export default function OfficeRequestsPageClient() {
  const t = useTranslations('officeRequests');
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin' || (session?.user as any)?.role === 'ADMIN';

  const params = usePaginationParams();
  const {
    officeRequests: fetchedOfficeRequests,
    isGetOfficeRequestsPending,
    totalOfficeRequestsCount,
  } = useGetAllOfficeRequests(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/office-requests',
    params,
    columns: officeRequestsExportColumns(t),
    mapRow: toOfficeRequestRow,
    fileName: 'office-requests',
  });

  const officeRequests = fetchedOfficeRequests;
  const { requestActionMutation } = useRequestAction();

  const [endShiftDialog, setEndShiftDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [custodyDialog, setCustodyDialog] = useState<{
    open: boolean;
    id: number | null;
    requestedAmount?: number | null;
  }>({
    open: false,
    id: null,
    requestedAmount: null,
  });

  return (
    <main>
      <div className="pageContainer">
        <EntitiesToolbar
          onAdd={!isAdmin ? () => router.push('/office-requests/create') : undefined}
          onExport={exportData}
          isExporting={isExporting}
        />
        <TableFilters applyDefaultDateRange={false} />
        {isGetOfficeRequestsPending ? (
          <p className="p-4 text-center">{t('loading')}</p>
        ) : (
          <>
            <OfficeRequestsTable
              data={officeRequests}
              isAdmin={isAdmin}
              onApprove={(id) => requestActionMutation({ id, status: 'APPROVED' })}
              onReject={(id) => requestActionMutation({ id, status: 'REJECTED' })}
              onApproveEndShift={(id) => setEndShiftDialog({ open: true, id })}
              onApproveCustody={(id) => {
                const row = officeRequests.find((r) => r.id === id);
                setCustodyDialog({
                  open: true,
                  id,
                  requestedAmount: row?.requestedAmount ?? null,
                });
              }}
            />
            <TablePagination totalCount={totalOfficeRequestsCount} />
          </>
        )}
      </div>

      <EndShiftActionDialog
        open={endShiftDialog.open}
        onOpenChange={(open) => setEndShiftDialog((s) => ({ ...s, open }))}
        requestId={endShiftDialog.id ?? 0}
      />
      <CustodyActionDialog
        open={custodyDialog.open}
        onOpenChange={(open) => setCustodyDialog((s) => ({ ...s, open }))}
        requestId={custodyDialog.id ?? 0}
        requestedAmount={custodyDialog.requestedAmount}
      />
    </main>
  );
}
