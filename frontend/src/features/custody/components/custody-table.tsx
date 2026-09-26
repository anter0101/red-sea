'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { usePageKey } from '@/utils/use-page-key';

import type { CustodyStatus } from '../enums/custody-status';
import type { ICustodyTableRow } from '../types';
import { CustodyPrintButton } from './custody-print-button';

const STATUS_COLORS: Record<CustodyStatus, string> = {
  ACTIVE: 'bg-badge-active-bg text-badge-active-fg border-transparent',
  INACTIVE: 'bg-amber-100 text-amber-800 border-transparent',
  CLOSED: 'bg-slate-100 text-slate-700 border-transparent',
};

interface CustodyTableProps {
  data: ICustodyTableRow[];
}

export default function CustodyTable({ data }: CustodyTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('custody');

  const columns = useMemo<ColumnDef<ICustodyTableRow>[]>(
    () => [
      {
        id: 'employeeName',
        accessorKey: 'employeeName',
        header: t('table.employee'),
        cell: ({ row }) => (
          <CodeLink href={`/custody/${row.original.id}`}>
            <span className="font-medium text-foreground">{row.original.employeeName}</span>
          </CodeLink>
        ),
      },
      { id: 'accountName', accessorKey: 'accountName', header: t('table.account') },
      { id: 'custodyAmount', accessorKey: 'custodyAmount', header: t('table.custodyAmount') },
      {
        id: 'journeyNumber',
        accessorKey: 'journeyNumber',
        header: t('table.journey'),
        cell: ({ row }) => (
          <CodeLink
            href={
              row.original.journeyId != null ? `/trips/${row.original.journeyId}` : null
            }
          >
            {row.original.journeyNumber}
          </CodeLink>
        ),
      },
      { id: 'driverName', accessorKey: 'driverName', header: t('table.driver') },
      { id: 'driverLicense', accessorKey: 'driverLicense', header: t('table.driverLicense') },
      {
        id: 'driverAssistantName',
        accessorKey: 'driverAssistantName',
        header: t('table.driverAssistant'),
      },
      { id: 'carPlate', accessorKey: 'carPlate', header: t('table.car') },
      { id: 'trailerPlate', accessorKey: 'trailerPlate', header: t('table.trailer') },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <Badge
            className={`rounded-full px-4 py-1 text-xs font-semibold ${STATUS_COLORS[row.original.status]}`}
          >
            {t(`statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      { id: 'createdAt', accessorKey: 'createdAt', header: t('table.createdAt') },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) =>
          row.original.journeyId ? (
            <CustodyPrintButton journeyId={row.original.journeyId} />
          ) : (
            '—'
          ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pageKey={pageKey}
      onRowDoubleClick={(row) => router.push(`/custody/${row.id}`)}
    />
  );
}
