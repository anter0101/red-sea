'use client';

import Link from 'next/link';

import ReusableCard from '@/components/common/reusable-card';
import type { CarStats } from '@/features/cars/api/get-car-stats';
import type { DriverStats } from '@/features/drivers/api/get-driver-stats';
import type { JourneyStats } from '@/features/trips/api/get-journey-stats';
import type { TrailerStats } from '@/features/trailers/api/get-trailer-stats';

type OpsKpiStripProps = {
  journeyStats?: JourneyStats;
  driverStats?: DriverStats;
  carStats?: CarStats;
  trailerStats?: TrailerStats;
  isLoading?: boolean;
};

function formatDistance(km?: number) {
  if (km == null || Number.isNaN(km)) return '—';
  return `${Math.round(km).toLocaleString('en-EG')} كم`;
}

export function OpsKpiStrip({
  journeyStats,
  driverStats,
  carStats,
  trailerStats,
  isLoading,
}: OpsKpiStripProps) {
  const dash = isLoading ? '…' : undefined;

  const tiles = [
    {
      href: '/trips',
      title: 'رحلات الفترة',
      value: dash ?? journeyStats?.journeyCount ?? 0,
      color: 'primary' as const,
    },
    {
      href: '/drivers',
      title: 'سائقون على الطريق',
      value: dash ?? driverStats?.onRoad ?? 0,
      color: 'secondary' as const,
    },
    {
      href: '/cars',
      title: 'سيارات على الطريق',
      value: dash ?? carStats?.onRoad ?? 0,
      color: 'success' as const,
    },
    {
      href: '/trailers',
      title: 'مقطورات على الطريق',
      value: dash ?? trailerStats?.onRoad ?? 0,
      color: 'blue' as const,
    },
    {
      href: '/trips',
      title: 'مسافة الفترة',
      value: dash ?? formatDistance(journeyStats?.totalDistance),
      color: 'primary' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5" dir="rtl">
      {tiles.map((tile) => (
        <Link key={tile.title} href={tile.href} className="min-w-0 block">
          <ReusableCard data={{ title: tile.title, value: tile.value }} color={tile.color} />
        </Link>
      ))}
    </div>
  );
}
