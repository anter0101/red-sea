'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { usePageKey } from '@/utils/use-page-key';

import type { IDriverTableRow } from '../api/get-all';

type EntityTableProps = {
  data: IDriverTableRow[];
};

export default function DriversTable({ data }: EntityTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('common.statuses');

  const columns = useMemo<ColumnDef<IDriverTableRow>[]>(
    () => [
      {
        id: 'driverCode',
        accessorKey: 'driverCode',
        header: 'كود السائق',
        cell: ({ row }) => (
          <CodeLink href={`/drivers/${row.original.id}`}>{row.original.driverCode}</CodeLink>
        ),
      },
      {
        id: 'driverName',
        accessorKey: 'driverName',
        header: 'اسم السائق',
        cell: ({ row }) => (
          <CodeLink href={`/drivers/${row.original.id}`}>{row.original.driverName}</CodeLink>
        ),
      },
      { id: 'license', accessorKey: 'license', header: 'الرخصة' },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <Badge className="capitalize px-4 py-1">{t(row.original.status as string)}</Badge>
        ),
      },
      { id: 'currentTrip', accessorKey: 'currentTrip', header: 'الرحلة الحالية' },
      {
        id: 'carCode',
        accessorKey: 'carCode',
        header: 'كود السيارة',
        cell: ({ row }) => (
          <CodeLink
            href={
              row.original.carId != null && row.original.carCode !== EMPTY_DISPLAY
                ? `/cars/${row.original.carId}`
                : null
            }
          >
            {row.original.carCode}
          </CodeLink>
        ),
      },
      { id: 'addedBy', accessorKey: 'addedBy', header: 'أضيف بواسطة' },
      { id: 'salary', accessorKey: 'salary', header: 'الراتب' },
    ],
    [t],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pageKey={pageKey}
      onRowDoubleClick={(row) => router.push(`/drivers/${row.id}`)}
    />
  );
}
