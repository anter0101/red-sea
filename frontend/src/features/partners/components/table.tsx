'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Mail, Phone } from 'lucide-react';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import type { IPartnerTableRow } from '@/features/partners/api/get-all';
import type { IPartner } from '@/features/partners/types/partner';
import { usePageKey } from '@/utils/use-page-key';

type PartnerRow = {
  id: number | undefined;
  name: string;
  bankAccountNumber: string;
  bankName: string;
  email: string;
  phone: string;
  address: string;
  createdBy: string;
  createdAt: string;
};

type EntityTableProps = {
  partners: (IPartner | IPartnerTableRow)[] | undefined;
};

export default function PartnersTable({ partners }: EntityTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const headers = useTranslations('partners.table.headers');

  const tableData = useMemo<PartnerRow[]>(
    () =>
      partners?.map((partner) => ({
        id: partner?.id,
        name: partner?.name ?? '-',
        bankAccountNumber: partner?.bankAccountNumber ?? '-',
        bankName: partner?.bankName ?? '-',
        email: partner?.email ?? '-',
        phone: partner?.phone ?? '-',
        address: partner?.address ?? '-',
        createdBy: partner?.createdBy ?? '-',
        createdAt: partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '-',
      })) ?? [],
    [partners],
  );

  const columns = useMemo<ColumnDef<PartnerRow>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: headers('name'),
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-1">
            <CodeLink href={row.original.id != null ? `/partners/${row.original.id}` : null}>
              {row.original.name}
            </CodeLink>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {row.original.email}
              <Mail className="w-3 h-3" />
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {row.original.phone}
              <Phone className="w-3 h-3" />
            </span>
          </div>
        ),
      },
      {
        id: 'bankAccountNumber',
        accessorKey: 'bankAccountNumber',
        header: headers('bank-account'),
      },
      { id: 'bankName', accessorKey: 'bankName', header: headers('bank-name') },
      {
        id: 'address',
        accessorKey: 'address',
        header: headers('address'),
        cell: ({ row }) => (
          <span className="text-wrap break-words truncate">{row.original.address}</span>
        ),
      },
      { id: 'createdBy', accessorKey: 'createdBy', header: headers('added-by') },
      { id: 'createdAt', accessorKey: 'createdAt', header: headers('join-date') },
    ],
    [headers],
  );

  return (
    <DataTable
      columns={columns}
      data={tableData}
      pageKey={pageKey}
      onRowDoubleClick={(row) => row.id != null && router.push(`/partners/${row.id}`)}
    />
  );
}
