'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import type { IDriverAssistantTableRow } from '@/features/driver-assistants/api/get-all';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { usePageKey } from '@/utils/use-page-key';

type DriverAssistantsTableProps = {
  data: IDriverAssistantTableRow[];
};

export default function DriverAssistantsTable({ data }: DriverAssistantsTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('common.statuses');

  const columns = useMemo<ColumnDef<IDriverAssistantTableRow>[]>(
    () => [
      {
        id: 'assistantCode',
        accessorKey: 'assistantCode',
        header: 'كود التابع',
        cell: ({ row }) => (
          <CodeLink href={`/driver-assistants/${row.original.id}`}>
            {row.original.assistantCode}
          </CodeLink>
        ),
      },
      {
        id: 'assistantName',
        accessorKey: 'assistantName',
        header: 'اسم التابع',
        cell: ({ row }) => (
          <CodeLink href={`/driver-assistants/${row.original.id}`}>
            {row.original.assistantName}
          </CodeLink>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <Badge className="capitalize px-4 py-1">{t(row.original.status as string)}</Badge>
        ),
      },
      { id: 'currentTrip', accessorKey: 'currentTrip', header: 'الرحلة التالية' },
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
      onRowDoubleClick={(row) => router.push(`/driver-assistants/${row.id}`)}
    />
  );
}
