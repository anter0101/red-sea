'use client';

import { useTranslations } from 'next-intl';
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
import { useDeleteSupplier } from '@/features/suppliers/api/delete';
import type { ISupplier } from '@/features/suppliers/types';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: ISupplier | null;
  onSuccess?: () => void;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('suppliers.delete-dialog');

  const { deleteSupplierMutation, isDeleteSupplierPending } = useDeleteSupplier();

  const handleConfirmDelete = () => {
    if (supplier?.id) {
      deleteSupplierMutation(supplier.id.toString(), {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description')}
            {supplier?.name && (
              <span className="block mt-2 font-semibold text-foreground">{supplier.name}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleteSupplierPending}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmDelete();
            }}
            disabled={isDeleteSupplierPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleteSupplierPending ? t('deleting') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
