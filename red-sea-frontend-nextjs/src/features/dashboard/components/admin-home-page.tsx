'use client';

import { useMemo, useState } from 'react';

import { useDashboardModuleCounts } from '@/features/dashboard/api/use-module-counts';
import { AttentionQueue } from '@/features/dashboard/components/attention-queue';
import { DashboardToolbar } from '@/features/dashboard/components/dashboard-toolbar';
import { JourneyPipeline } from '@/features/dashboard/components/journey-pipeline';
import { ModulesInfoGrid } from '@/features/dashboard/components/modules-info-grid';
import { OpsKpiStrip } from '@/features/dashboard/components/ops-kpi-strip';
import {
  getDashboardDateRange,
  type DashboardRangePreset,
} from '@/features/dashboard/utils/date-range';
import { useGetCarStats } from '@/features/cars/api/get-car-stats';
import { useGetDriverAssistantStats } from '@/features/driver-assistants/api/get-assistant-stats';
import { useGetDriverStats } from '@/features/drivers/api/get-driver-stats';
import { useGetTrailerStats } from '@/features/trailers/api/get-trailer-stats';
import { useGetJourneyStats } from '@/features/trips/api/get-journey-stats';

export default function AdminHomePage() {
  const [range, setRange] = useState<DashboardRangePreset>('today');
  const dateParams = useMemo(() => getDashboardDateRange(range), [range]);

  const journeyQuery = useGetJourneyStats(dateParams);
  const driversQuery = useGetDriverStats();
  const assistantsQuery = useGetDriverAssistantStats();
  const carsQuery = useGetCarStats();
  const trailersQuery = useGetTrailerStats();
  const moduleCounts = useDashboardModuleCounts();

  const kpiLoading =
    journeyQuery.isPending ||
    driversQuery.isPending ||
    carsQuery.isPending ||
    trailersQuery.isPending;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <DashboardToolbar range={range} onRangeChange={setRange} />

      <OpsKpiStrip
        journeyStats={journeyQuery.data}
        driverStats={driversQuery.data}
        carStats={carsQuery.data}
        trailerStats={trailersQuery.data}
        isLoading={kpiLoading}
      />

      <JourneyPipeline journeyStats={journeyQuery.data} isLoading={journeyQuery.isPending} />

      <ModulesInfoGrid
        driverStats={driversQuery.data}
        assistantStats={assistantsQuery.data}
        carStats={carsQuery.data}
        trailerStats={trailersQuery.data}
        partnersCount={moduleCounts.partnersCount}
        clientsCount={moduleCounts.clientsCount}
        branchesCount={moduleCounts.branchesCount}
        warehouseTotal={moduleCounts.warehouseTotal}
        lowStockCount={moduleCounts.lowStockCount}
        suppliersCount={moduleCounts.suppliersCount}
        gpsCount={moduleCounts.gpsCount}
        custodyActiveCount={moduleCounts.custodyActiveCount}
        officePendingCount={moduleCounts.officePendingCount}
      />

      <AttentionQueue
        officePendingCount={moduleCounts.officePendingCount}
        lowStockCount={moduleCounts.lowStockCount}
      />
    </div>
  );
}
