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

import { useDeleteEmployee } from '@/features/employees/api/delete';

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number | null;
  onSuccess?: () => void;
}

export default function DeleteEmployeeDialog({
  open,
  onOpenChange,
  employeeId,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const { deleteEmployeeMutation, isDeleteEmployeePending } = useDeleteEmployee();

  const handleConfirmDelete = () => {
    if (employeeId) {
      deleteEmployeeMutation(employeeId.toString(), {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">{t('delete-dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            {t('delete-dialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleteEmployeePending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleteEmployeePending ? t('delete-dialog.deleting') : tCommon('actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
