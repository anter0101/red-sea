'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePageKey } from '@/utils/use-page-key';

import type { IWarehouseTableRow } from '../api/get-all';
import { useDeleteProduct } from '../api/delete';

type ProductsTableProps = {
  data?: IWarehouseTableRow[];
};

export default function ProductsTable({ data }: ProductsTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const { deleteProductMutation, isDeleteProductPending } = useDeleteProduct();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IWarehouseTableRow | null>(null);

  const handleConfirmDelete = () => {
    if (!productToDelete?.id) return;
    deleteProductMutation(productToDelete.id.toString(), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      },
    });
  };

  const columns = useMemo<ColumnDef<IWarehouseTableRow>[]>(
    () => [
      {
        id: 'productCode',
        accessorKey: 'productCode',
        header: 'كود المنتج',
        cell: ({ row }) => (
          <CodeLink href={row.original.id != null ? `/warehouse/${row.original.id}` : null}>
            {row.original.productCode}
          </CodeLink>
        ),
      },
      { id: 'name', accessorKey: 'name', header: 'اسم المنتج' },
      { id: 'category', accessorKey: 'category', header: 'الفئة' },
      { id: 'status', accessorKey: 'status', header: 'الحالة' },
      { id: 'condition', accessorKey: 'condition', header: 'حالة الاستخدام' },
      { id: 'unit', accessorKey: 'unit', header: 'الوحدة' },
      {
        id: 'quantity',
        accessorKey: 'quantity',
        header: 'العدد',
        cell: ({ row }) => {
          const isLowStock = row.original.quantity <= row.original.alertQuantity;
          return (
            <span className={isLowStock ? 'text-red-600 font-medium' : undefined}>
              {row.original.quantity}
              {isLowStock ? ' ⚠' : ''}
            </span>
          );
        },
      },
      { id: 'alertQuantity', accessorKey: 'alertQuantity', header: 'عدد التنبيه' },
      { id: 'supplierName', accessorKey: 'supplierName', header: 'المورد' },
      { id: 'unitPrice', accessorKey: 'unitPrice', header: 'سعر الوحدة' },
      { id: 'purchaseDate', accessorKey: 'purchaseDate', header: 'تاريخ الشراء' },
      { id: 'expiryDate', accessorKey: 'expiryDate', header: 'تاريخ الصلاحية' },
      { id: 'createdAt', accessorKey: 'createdAt', header: 'تاريخ التسجيل' },
      {
        id: 'lastUsedDate',
        accessorKey: 'lastUsedDate',
        header: 'آخر تاريخ صرف',
        cell: ({ row }) =>
          row.original.lastUsedDate && row.original.lastUsedDate !== '-'
            ? new Date(row.original.lastUsedDate).toLocaleDateString('ar-EG')
            : '—',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/warehouse/${item.id}`)}>
                <Eye className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/warehouse/${item.id}/update`)}
              >
                <Pencil className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProductToDelete(item);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        pageKey={pageKey}
        onRowDoubleClick={(row) => row.id != null && router.push(`/warehouse/${row.id}`)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟
              {productToDelete?.name && (
                <span className="block mt-2 font-semibold text-foreground">
                  {productToDelete.name}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteProductPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleteProductPending}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
