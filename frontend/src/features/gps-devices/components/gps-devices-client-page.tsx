'use client';

import React from 'react';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllDevices } from '../api/get-all-devices';
import { gpsDevicesExportColumns, mapDeviceRow } from '../export.config';

import DevicesTable from './devices-table';

export default function GpsDevicesClientPage() {
  const params = usePaginationParams();
  const { devices, totalDevicesCount } = useGetAllDevices(params);
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/gps-devices',
    params,
    columns: gpsDevicesExportColumns(),
    mapRow: mapDeviceRow,
    fileName: 'gps-devices',
  });

  return (
    <div className="flex flex-col gap-4">
      <EntitiesToolbar onAdd={() => {}} onExport={exportData} isExporting={isExporting} />
      <TableFilters />
      <DevicesTable data={devices || []} />
      <TablePagination totalCount={totalDevicesCount} />
    </div>
  );
}
