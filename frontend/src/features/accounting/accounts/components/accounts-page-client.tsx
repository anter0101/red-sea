'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { serializeAccountListParams, useGetAllAccounts } from '../api/get-all';
import { useDeleteAccount } from '../api/delete';
import { accountsExportColumns, mapAccountRow } from '../export.config';
import { buildAccountTree } from '../utils/build-account-tree';

import AccountsChartTree from './accounts-chart-tree';
import AccountFormDialog from './account-form-dialog';

const CHART_PAGE_SIZE = 2000;

export default function AccountsPageClient() {
  const t = useTranslations('accounting.accounts');
  const { search, createdAtFrom, createdAtTo } = usePaginationParams();

  const accountParams = useMemo(
    () => ({
      page: 1,
      pageSize: CHART_PAGE_SIZE,
      includeParent: true,
      search,
      createdAtFrom,
      createdAtTo,
    }),
    [search, createdAtFrom, createdAtTo],
  );

  const { accounts, isGetAccountsPending } = useGetAllAccounts(accountParams);
  const roots = useMemo(() => buildAccountTree(accounts), [accounts]);

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/accounting/accounts',
    params: serializeAccountListParams(accountParams),
    columns: accountsExportColumns(t),
    mapRow: mapAccountRow,
    fileName: 'accounts',
  });
  const { deleteAccountMutation } = useDeleteAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<{ id: number } | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleAdd = () => {
    setEditData(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: number, accountData?: (typeof accounts)[number]) => {
    if (accountData) {
      setEditData(accountData);
      setFormOpen(true);
      return;
    }
    const account = accounts.find((a) => a.id === id);
    if (account) {
      setEditData(account);
      setFormOpen(true);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId !== null) {
      deleteAccountMutation(deleteTargetId.toString());
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <main>
      <div className="pageContainer">
        <EntitiesToolbar onAdd={handleAdd} onExport={exportData} isExporting={isExporting} />
        <TableFilters showDatePicker={false} />

        {isGetAccountsPending ? (
          <p className="p-4 text-center">{t('list.loading')}</p>
        ) : (
          <AccountsChartTree roots={roots} onEdit={handleEdit} onDelete={handleDeleteClick} />
        )}

        <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} editData={editData} />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('actions.confirm-delete')}</DialogTitle>
              <DialogDescription>{t('actions.confirm-delete-desc')}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
