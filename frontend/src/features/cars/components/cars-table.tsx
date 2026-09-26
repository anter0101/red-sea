'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';

import UpdateVehicleStatusDialog from '@/components/common/update-vehicle-status-dialog';
import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Button } from '@/components/ui/button';
import { translateVehicleColor } from '@/data/vehicle-colors';
import { OwnerShipTypes } from '@/enums/ownership';
import type { VehicleStatus } from '@/enums/vehicle-status';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { useUpdateCar } from '@/features/cars/apis/update';
import { usePageKey } from '@/utils/use-page-key';

import type { ICarTableRow } from '../api/get-all';

type CarsTableProps = {
  data?: ICarTableRow[];
};

export default function CarsTable({ data }: CarsTableProps) {
  const router = useRouter();
  const pageKey = usePageKey();
  const t = useTranslations('cars');
  const tColors = useTranslations('common.vehicle-colors');
  const tChangeStatus = useTranslations('common.change-status');
  const { updateCarMutation, isUpdateCarPending } = useUpdateCar();
  const [selectedCar, setSelectedCar] = useState<ICarTableRow | null>(null);

  const ownershipLabel = (key: string) => {
    if (!key || key === EMPTY_DISPLAY) return key;
    if (Object.values(OwnerShipTypes).includes(key as OwnerShipTypes)) {
      return t(`ownership.types.${key}`);
    }
    return key;
  };

  const statusLabel = (key: string) => {
    if (!key || key === EMPTY_DISPLAY) return key;
    return t(`statuses.${key}`);
  };

  const colorLabel = (key: string) => {
    if (!key || key === EMPTY_DISPLAY) return key;
    return translateVehicleColor(tColors, key, key);
  };

  const maxWeightLabel = (value: string) => {
    if (!value || value === EMPTY_DISPLAY) return value;
    return `${value} ${t('units.ton')}`;
  };

  const handleSaveStatus = (status: VehicleStatus) => {
    if (!selectedCar) return;
    updateCarMutation(
      { id: selectedCar.id, data: { status } },
      {
        onSuccess: () => setSelectedCar(null),
      },
    );
  };

  const columns = useMemo<ColumnDef<ICarTableRow>[]>(
    () => [
      {
        id: 'carCode',
        accessorKey: 'carCode',
        header: 'الكود',
        cell: ({ row }) => (
          <CodeLink href={`/cars/${row.original.id}`}>{row.original.carCode}</CodeLink>
        ),
      },
      { id: 'manufacturer', accessorKey: 'manufacturer', header: 'المصنّع' },
      { id: 'model', accessorKey: 'model', header: 'الموديل' },
      { id: 'year', accessorKey: 'year', header: 'السنة' },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => statusLabel(row.original.status),
      },
      {
        id: 'color',
        accessorKey: 'color',
        header: 'اللون',
        cell: ({ row }) => colorLabel(row.original.color),
      },
      { id: 'axleCount', accessorKey: 'axleCount', header: 'عدد المحاور' },
      {
        id: 'maxWeight',
        accessorKey: 'maxWeight',
        header: t('fields.max-weight'),
        cell: ({ row }) => maxWeightLabel(row.original.maxWeight),
      },
      { id: 'plateLetters', accessorKey: 'plateLetters', header: 'الحروف' },
      { id: 'plateNumber', accessorKey: 'plateNumber', header: 'رقم اللوحة' },
      { id: 'chassis', accessorKey: 'chassis', header: 'الشاسيه' },
      {
        id: 'ownership',
        accessorKey: 'ownership',
        header: 'الملكية',
        cell: ({ row }) => ownershipLabel(row.original.ownership),
      },
      { id: 'license', accessorKey: 'license', header: 'الرخصة' },
      { id: 'licenseExpiry', accessorKey: 'licenseExpiry', header: 'تاريخ الانتهاء' },
      { id: 'addedBy', accessorKey: 'addedBy', header: 'اضيف بواسطة' },
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
              onClick={() => setSelectedCar(row.original)}
            >
              <Pencil className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        ),
      },
    ],
    // Labels close over t*/helpers; regenerate when locale strings change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tChangeStatus, tColors],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        pageKey={pageKey}
        onRowDoubleClick={(row) => router.push(`/cars/${row.id}`)}
      />

      <UpdateVehicleStatusDialog
        open={!!selectedCar}
        onOpenChange={(open) => {
          if (!open) setSelectedCar(null);
        }}
        currentStatus={selectedCar?.status}
        isPending={isUpdateCarPending}
        onSave={handleSaveStatus}
      />
    </>
  );
}
