'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ISupplierTableRow } from '@/features/suppliers/api/get-all';
import type { ISupplier } from '@/features/suppliers/types';
import { SupplierType } from '@/features/suppliers/enums/supplier-type';
import { cn } from '@/lib/utils';
import { usePageKey } from '@/utils/use-page-key';

import DeleteConfirmationDialog from './delete-confirmation-dialog';

type SupplierRow = {
  id: number | undefined;
  code: string;
  name: string;
  type: SupplierType | undefined;
  governorate: string;
  phone: string;
};

type SupplierTableProps = {
  suppliers: (ISupplier | ISupplierTableRow)[] | undefined;
};

const typeBadgeClass: Record<SupplierType, string> = {
  [SupplierType.GOODS]: 'bg-emerald-500 hover:bg-emerald-600',
  [SupplierType.SERVICES]: 'bg-violet-500 hover:bg-violet-600',
  [SupplierType.TRANSPORTATION]: 'bg-blue-500 hover:bg-blue-600',
};

export default function SupplierTable({ suppliers }: SupplierTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('suppliers');
  const headers = useTranslations('suppliers.table.headers');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<ISupplier | null>(null);

  const tableData = useMemo<SupplierRow[]>(
    () =>
      suppliers?.map((supplier) => ({
        id: supplier?.id,
        code: supplier?.code ?? '-',
        name: supplier?.name ?? '-',
        type: supplier?.type,
        governorate:
          ('government' in supplier && supplier.government?.name) ||
          ('governorate' in supplier && (supplier as ISupplierTableRow).governorate) ||
          '-',
        phone: supplier?.phone ?? '-',
      })) ?? [],
    [suppliers],
  );

  const columns = useMemo<ColumnDef<SupplierRow>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: headers('code'),
        cell: ({ row }) => (
          <CodeLink href={row.original.id != null ? `/suppliers/${row.original.id}` : null}>
            {row.original.code}
          </CodeLink>
        ),
      },
      { id: 'name', accessorKey: 'name', header: headers('name') },
      {
        id: 'type',
        accessorKey: 'type',
        header: headers('type'),
        cell: ({ row }) =>
          row.original.type ? (
            <Badge
              variant="default"
              className={cn(typeBadgeClass[row.original.type], 'text-white px-3')}
            >
              {t(`types.${row.original.type}`)}
            </Badge>
          ) : (
            '-'
          ),
      },
      { id: 'governorate', accessorKey: 'governorate', header: headers('governorate') },
      { id: 'phone', accessorKey: 'phone', header: headers('phone') },
      {
        id: 'actions',
        header: headers('actions'),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => item.id != null && router.push(`/suppliers/${item.id}`)}
              >
                <Eye className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => item.id != null && router.push(`/suppliers/${item.id}/update`)}
              >
                <Pencil className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const supplier = suppliers?.find((s) => s.id === item.id);
                  if (supplier && 'commercialRegister' in supplier) {
                    setSupplierToDelete(supplier);
                    setDeleteDialogOpen(true);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [headers, router, suppliers, t],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        pageKey={pageKey}
        onRowDoubleClick={(row) => row.id != null && router.push(`/suppliers/${row.id}`)}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        supplier={supplierToDelete}
        onSuccess={() => setSupplierToDelete(null)}
      />
    </>
  );
}
