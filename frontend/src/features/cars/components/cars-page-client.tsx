'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { translateVehicleColor } from '@/data/vehicle-colors';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useTableExport } from '@/hooks/use-table-export';

import { useGetAllCars } from '../api/get-all';
import { useGetCarStats } from '../api/get-car-stats';
import { carsExportColumns, mapCarRow } from '../export.config';

import CarsTable from './cars-table';

export default function CarsPageClient() {
  const router = useRouter();
  const t = useTranslations('cars');
  const tStatus = useTranslations('cars.statuses');
  const tColors = useTranslations('common.vehicle-colors');
  const params = usePaginationParams();
  const { cars, isGetCarsPending, totalCarsCount } = useGetAllCars(params);
  const { data: stats, isPending: isStatsPending } = useGetCarStats();
  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/cars',
    params,
    columns: carsExportColumns(
      tStatus,
      (key) => translateVehicleColor(tColors, key, key),
      (key) => t(`units.${key}`),
      t('fields.max-weight'),
    ),
    mapRow: mapCarRow,
    fileName: 'cars',
  });

  return (
    <div className="pageContainer">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <ReusableCard
          data={{
            title: 'سيارات علي الطريق ',
            value: isStatsPending ? '...' : (stats?.onRoad ?? 0),
          }}
          color="primary"
        />
        <ReusableCard
          data={{
            title: 'سيارات الشركة',
            value: isStatsPending ? '...' : (stats?.company ?? 0),
          }}
          color="secondary"
        />
        <ReusableCard
          data={{
            title: 'سيارات المشتركة',
            value: isStatsPending ? '...' : (stats?.share ?? 0),
          }}
          color="primary"
        />
      </div>
      <EntitiesToolbar
        onAdd={() => router.push('/cars/create')}
        onExport={exportData}
        isExporting={isExporting}
      />
      <TableFilters />
      {isGetCarsPending ? (
        <p className="text-center p-4">جاري التحميل...</p>
      ) : (
        <>
          <CarsTable data={cars ?? []} />
          <TablePagination totalCount={totalCarsCount} />
        </>
      )}
    </div>
  );
}
