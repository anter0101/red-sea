'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllTransactions } from '../api/get-all';
import { mapTransactionRow, transactionsExportColumns } from '../export.config';

import TransactionsTable from './transactions-table';
import TransactionFormDialog from './transaction-form-dialog';

export default function TransactionsPageClient() {
  const t = useTranslations('accounting.transactions');
  const params = usePaginationParams();
  const { transactions, isGetTransactionsPending, totalTransactionsCount } =
    useGetAllTransactions(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/accounting/transactions',
    params,
    columns: transactionsExportColumns(t),
    mapRow: mapTransactionRow,
    fileName: 'transactions',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleAdd = () => {
    setEditId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setFormOpen(true);
  };

  return (
    <main>
      <div className="pageContainer">
        <EntitiesToolbar
          onAdd={handleAdd}
          onExport={exportData}
          isExporting={isExporting}
        />
        <TableFilters applyDefaultDateRange={true} />

        {isGetTransactionsPending ? (
          <p className="text-center p-4">{t('list.loading')}</p>
        ) : (
          <>
            <TransactionsTable data={transactions} onEdit={handleEdit} />
            <TablePagination totalCount={totalTransactionsCount} />
          </>
        )}

        <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} editId={editId} />
      </div>
    </main>
  );
}
