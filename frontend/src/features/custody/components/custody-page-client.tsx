'use client';

import { Wallet } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { useGetOfficeCustodyAmount } from '@/features/office/api/get-custody-amount';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { toCustodyRow, useGetAllCustodies } from '../api/get-all';
import { custodyExportColumns } from '../export.config';
import CustodyTable from './custody-table';

export default function CustodyPageClient() {
  const t = useTranslations('custody');
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';

  const params = usePaginationParams();
  const { custodies, isGetCustodiesPending, totalCustodiesCount } = useGetAllCustodies(params);
  const { custodyAmount, isCustodyAmountPending } = useGetOfficeCustodyAmount({ enabled: !isAdmin });
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/custodies',
    params,
    columns: custodyExportColumns(t),
    mapRow: toCustodyRow,
    fileName: 'custody',
  });

  const custodyAmountValue = isCustodyAmountPending
    ? '—'
    : custodyAmount?.custodyAmount != null
      ? `${custodyAmount.custodyAmount} EGP`
      : '—';

  return (
    <main>
      <div className="pageContainer">
        {!isAdmin && (
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: t('stats.myCustodyAmount'),
                value: custodyAmountValue,
                description: custodyAmount?.accountName,
                icon: <Wallet className="h-6 w-6" />,
              }}
              color="primary"
            />
          </div>
        )}

        <EntitiesToolbar onExport={exportData} isExporting={isExporting} />
        <TableFilters applyDefaultDateRange={false} />
        {isGetCustodiesPending ? (
          <p className="p-4 text-center">{t('loading')}</p>
        ) : (
          <>
            <CustodyTable data={custodies} />
            <TablePagination totalCount={totalCustodiesCount} />
          </>
        )}
      </div>
    </main>
  );
}
