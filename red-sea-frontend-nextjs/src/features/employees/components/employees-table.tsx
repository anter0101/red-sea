'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePageKey } from '@/utils/use-page-key';

import type { IEmployeeTableRow } from '../types';

type EmployeesTableProps = {
  data: IEmployeeTableRow[];
  branchId: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 hover:bg-green-100',
  UNAVAILABLE: 'bg-red-100 text-red-800 hover:bg-red-100',
  ONROAD: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
};

export default function EmployeesTable({ data, branchId, onEdit, onDelete }: EmployeesTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');

  const columns = useMemo<ColumnDef<IEmployeeTableRow>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: t('table.employee'),
        cell: ({ row }) => (
          <CodeLink href={`/branches/${branchId}/employees/${row.original.id}`}>
            {row.original.name}
          </CodeLink>
        ),
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: t('table.role'),
        cell: ({ row }) => (row.original.role ? t(`roles.${row.original.role}`) : '—'),
      },
      { id: 'custody', accessorKey: 'custody', header: t('table.custody') },
      { id: 'lastSeen', accessorKey: 'lastSeen', header: t('table.last-seen') },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <Badge
            className={`capitalize px-3 py-1 ${statusColors[row.original.status] || 'bg-gray-100 text-gray-800'}`}
          >
            {tCommon(`statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      { id: 'salary', accessorKey: 'salary', header: t('table.salary') },
      {
        id: 'salaryType',
        accessorKey: 'salaryType',
        header: t('table.salary-type'),
        cell: ({ row }) =>
          row.original.salaryType ? t(`salary-types.${row.original.salaryType}`) : '—',
      },
      { id: 'joinDate', accessorKey: 'joinDate', header: t('table.join-date') },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/branches/${branchId}/employees/${row.original.id}`}>
                <Eye className="w-4 h-4 text-blue-600" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(row.original.id)}>
              <Pencil className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    [branchId, onDelete, onEdit, t, tCommon],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pageKey={pageKey || 'employees'}
      onRowDoubleClick={(row) => router.push(`/branches/${branchId}/employees/${row.id}`)}
    />
  );
}
