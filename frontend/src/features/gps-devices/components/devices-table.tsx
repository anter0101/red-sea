'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MapPin } from 'lucide-react';

import { CodeLink } from '@/components/main-table/code-link';
import { DataTable } from '@/components/main-table/data-table';
import { Button } from '@/components/ui/button';
import { usePageKey } from '@/utils/use-page-key';

import { IDeviceResponse } from '../types/device';
import { AddressCell } from './address';
import AssignCarDeviceDialog from './assing-car-form';

type DevicesTableProps = {
  data?: IDeviceResponse[];
};

export default function DevicesTable({ data }: DevicesTableProps) {
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const router = useRouter();
  const pageKey = usePageKey();

  const handleLocation = (lat?: number, lng?: number) => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const columns = useMemo<ColumnDef<IDeviceResponse>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'اسم الجهاز',
        cell: ({ row }) => (
          <CodeLink href={row.original.id != null ? `/gps/${row.original.id}` : null}>
            {row.original.name || '-'}
          </CodeLink>
        ),
      },
      {
        id: 'imei',
        accessorKey: 'imei',
        header: 'IMEI',
        cell: ({ row }) => (
          <CodeLink href={row.original.id != null ? `/gps/${row.original.id}` : null}>
            {row.original.imei || '-'}
          </CodeLink>
        ),
      },
      {
        id: 'speed',
        accessorKey: 'speed',
        header: 'السرعة',
        cell: ({ row }) => `${row.original.speed ?? 0} km/h`,
      },
      {
        id: 'location',
        header: 'الموقع',
        cell: ({ row }) => (
          <AddressCell lat={row.original.lastLatitude} lng={row.original.lastLongitude} />
        ),
      },
      {
        id: 'engineStatus',
        accessorKey: 'engineStatus',
        header: 'حالة المحرك',
        cell: ({ row }) =>
          row.original.engineStatus ? (
            <span className="text-green-600">تشغيل</span>
          ) : (
            <span className="text-red-600">إيقاف</span>
          ),
      },
      {
        id: 'signalStrength',
        accessorKey: 'signalStrength',
        header: 'الإشارة',
        cell: ({ row }) => `${row.original.signalStrength ?? '-'}%`,
      },
      {
        id: 'batteryLevel',
        accessorKey: 'batteryLevel',
        header: 'البطارية',
        cell: ({ row }) =>
          row.original.batteryLevel !== null && row.original.batteryLevel !== undefined
            ? `${row.original.batteryLevel}%`
            : '-',
      },
      {
        id: 'lastUpdate',
        accessorKey: 'lastUpdate',
        header: 'آخر تحديث',
        cell: ({ row }) =>
          row.original.lastUpdate ? new Date(row.original.lastUpdate).toLocaleString() : '-',
      },
      {
        id: 'car',
        header: 'السيارة',
        cell: ({ row }) =>
          row.original.car?.licenseNumber || (
            <Button
              size="sm"
              onClick={() => {
                if (row.original.id == null) return;
                setSelectedDeviceId(row.original.id);
                setOpenAssign(true);
              }}
            >
              اضافة سيارة
            </Button>
          ),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => row.original.id != null && router.push(`/gps/${row.original.id}`)}
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLocation(row.original.lastLatitude, row.original.lastLongitude)}
            >
              <MapPin className="w-5 h-5 text-green-600" />
            </Button>
          </div>
        ),
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
        onRowDoubleClick={(row) => row.id != null && router.push(`/gps/${row.id}`)}
      />
      {selectedDeviceId && (
        <AssignCarDeviceDialog
          open={openAssign}
          onOpenChange={setOpenAssign}
          deviceId={selectedDeviceId}
        />
      )}
    </>
  );
}
