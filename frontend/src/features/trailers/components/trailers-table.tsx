'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';

import UpdateVehicleStatusDialog from '@/components/common/update-vehicle-status-dialog';
import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OwnerShipTypes } from '@/enums/ownership';
import type { VehicleStatus } from '@/enums/vehicle-status';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { useUpdateTrailer } from '@/features/trailers/apis/update';
import { usePageKey } from '@/utils/use-page-key';

import type { ITrailerTableRow } from '../api/get-all';

type TrailersTableProps = {
  data?: ITrailerTableRow[];
};

export default function TrailersTable({ data }: TrailersTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('common');
  const tTrailers = useTranslations('trailers');
  const tChangeStatus = useTranslations('common.change-status');
  const { updateTrailerMutation, isUpdateTrailerPending } = useUpdateTrailer();
  const [selectedTrailer, setSelectedTrailer] = useState<ITrailerTableRow | null>(null);

  const ownershipLabel = (key: string) => {
    if (!key || key === EMPTY_DISPLAY) return key;
    if (Object.values(OwnerShipTypes).includes(key as OwnerShipTypes)) {
      return tTrailers(`ownership.types.${key}`);
    }
    return key;
  };

  const statusLabel = (key: string) => {
    if (!key || key === EMPTY_DISPLAY) return key;
    return t(`statuses.${key}`);
  };

  const handleSaveStatus = (status: VehicleStatus) => {
    if (!selectedTrailer) return;
    updateTrailerMutation(
      { id: selectedTrailer.id, data: { status } },
      {
        onSuccess: () => setSelectedTrailer(null),
      },
    );
  };

  const columns = useMemo<ColumnDef<ITrailerTableRow>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: 'كود المقطورة',
        cell: ({ row }) => (
          <CodeLink href={`/trailers/${row.original.id}`}>{row.original.code}</CodeLink>
        ),
      },
      { id: 'plateLetters', accessorKey: 'plateLetters', header: 'الحروف' },
      { id: 'plateNumber', accessorKey: 'plateNumber', header: 'رقم اللوحة' },
      {
        id: 'ownerShip',
        accessorKey: 'ownerShip',
        header: 'الملكية',
        cell: ({ row }) => ownershipLabel(row.original.ownerShip),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <Badge className="capitalize px-4 py-1">{statusLabel(row.original.status)}</Badge>
        ),
      },
      { id: 'licenseNumber', accessorKey: 'licenseNumber', header: 'رقم الرخصة' },
      { id: 'licenseExpiryDate', accessorKey: 'licenseExpiryDate', header: 'تاريخ انتهاء الرخصة' },
      { id: 'createdBy', accessorKey: 'createdBy', header: 'أضيف بواسطة' },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={tChangeStatus('action')}
              onClick={() => setSelectedTrailer(row.original)}
            >
              <Pencil className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tChangeStatus, tTrailers],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        pageKey={pageKey}
        onRowDoubleClick={(row) => router.push(`/trailers/${row.id}`)}
      />

      <UpdateVehicleStatusDialog
        open={!!selectedTrailer}
        onOpenChange={(open) => {
          if (!open) setSelectedTrailer(null);
        }}
        currentStatus={selectedTrailer?.status}
        isPending={isUpdateTrailerPending}
        onSave={handleSaveStatus}
      />
    </>
  );
}
