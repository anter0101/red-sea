'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TablePagination from '@/components/common/table-pagination';
import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { usePageKey } from '@/utils/use-page-key';
import { useGetAllInvoices } from '../api/get-all';
import type { InvoiceView } from '../types';
import { InvoicePrintButton } from './invoice-print-button';
import { formatMoney } from './money';
import { ServicesClaimPrintButton } from './services-claim-print-button';

export default function InvoicesPageClient() {
  const t = useTranslations('invoices');
  const router = useRouter();
  const pageKey = usePageKey();
  const params = usePaginationParams();
  const { invoices, totalCount, isPending } = useGetAllInvoices(params);

  const columns: ColumnDef<InvoiceView>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: t('code'),
      cell: ({ row }) => (
        <CodeLink href={`/invoices/${row.original.id}`}>{row.original.code}</CodeLink>
      ),
    },
    { id: 'clientName', accessorKey: 'clientName', header: t('client') },
    { id: 'date', accessorKey: 'date', header: t('date') },
    {
      id: 'taxEnabled',
      accessorKey: 'taxEnabled',
      header: t('tax'),
      cell: ({ row }) => (row.original.taxEnabled ? t('taxOn') : t('taxOff')),
    },
    {
      id: 'totalRevenue',
      accessorKey: 'totalRevenue',
      header: t('total'),
      cell: ({ row }) => formatMoney(row.original.totalRevenue),
    },
    {
      id: 'vatAmount',
      accessorKey: 'vatAmount',
      header: t('vat'),
      cell: ({ row }) => formatMoney(row.original.vatAmount),
    },
    {
      id: 'withholdingAmount',
      accessorKey: 'withholdingAmount',
      header: t('withholding'),
      cell: ({ row }) => formatMoney(row.original.withholdingAmount),
    },
    {
      id: 'netAmount',
      accessorKey: 'netAmount',
      header: t('net'),
      cell: ({ row }) => formatMoney(row.original.netAmount),
    },
    { id: 'journeyCount', accessorKey: 'journeyCount', header: t('journeys') },
    {
      id: 'printServicesClaim',
      header: t('printServicesClaim'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ServicesClaimPrintButton invoice={row.original} />
        </div>
      ),
    },
    {
      id: 'print',
      header: t('print'),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <InvoicePrintButton invoice={row.original} />
        </div>
      ),
    },
    
  ];

  return (
    <div className="pageContainer">
      <EntitiesToolbar />
      {isPending ? (
        <p className="p-4 text-center">جاري التحميل...</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={invoices}
            pageKey={pageKey}
            onRowDoubleClick={(row) => router.push(`/invoices/${row.id}`)}
          />
          <TablePagination totalCount={totalCount} />
        </>
      )}
    </div>
  );
}
