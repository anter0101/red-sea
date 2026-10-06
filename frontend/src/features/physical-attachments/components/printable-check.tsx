'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import {
  findTireOnAxle,
  VehicleChassisOverview,
  type TirePositionKey,
} from '@/components/common/axle-overview';
import {
  getApiLocationCode as carLocation,
  getTirePositionsForAxle as carPositions,
} from '@/features/cars/utils/location-mapping';
import {
  getApiLocationCode as trailerLocation,
  getTirePositionsForAxle as trailerPositions,
} from '@/features/trailers/utils/location-mapping';
import type { IAxle } from '@/types/axles';

import redSeaLogo from '../../../../public/assets/icons/red-sea-logo.svg';
import type { IPhysicalAttachment, VehicleType } from '../types';

type Props = {
  vehicleType: VehicleType;
  vehicleCode?: string;
  plate?: string;
  printDate: string;
  items: IPhysicalAttachment[];
  axles: IAxle[];
  axleCount: number;
  formatDateTime: (value?: string | null) => string;
};

const POSITION_LABELS: Record<TirePositionKey, string> = {
  leftOuter: 'positions.left-outer',
  leftInner: 'positions.left-inner',
  rightOuter: 'positions.right-outer',
  rightInner: 'positions.right-inner',
};

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-black px-3 py-2 not-last:border-l">
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export const PrintableCheck = forwardRef<HTMLDivElement, Props>(function PrintableCheck(
  { vehicleType, vehicleCode, plate, printDate, items, axles, axleCount, formatDateTime },
  ref,
) {
  const t = useTranslations('physicalAttachments');
  const tMaintenance = useTranslations('maintenance');
  const getPositions = vehicleType === 'car' ? carPositions : trailerPositions;
  const getLocation = vehicleType === 'car' ? carLocation : trailerLocation;

  return (
    <div
      ref={ref}
      dir="rtl"
      className="bg-white p-6 text-sm text-black"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      <header className="grid grid-cols-3 items-center border-b-2 border-black pb-3">
        <img src={redSeaLogo.src} alt="Red Sea" className="h-14 w-auto justify-self-start" />
        <div className="text-center">
          <p className="text-lg font-bold">{t('print.title')}</p>
          <p className="text-xs">البحر الأحمر</p>
        </div>
        <div />
      </header>

      <div className="mt-4 grid grid-cols-3 border border-black">
        <Meta label={t('print.vehicle')} value={vehicleCode || '—'} />
        <Meta label={t('print.plate')} value={plate || '—'} />
        <Meta label={t('print.print-date')} value={printDate} />
      </div>

      <table className="mt-4 w-full border-collapse border border-black text-center">
        <thead>
          <tr className="bg-neutral-100">
            <th className="w-12 border border-black px-2 py-1.5 font-semibold">#</th>
            <th className="border border-black px-2 py-1.5 font-semibold">{t('columns.name')}</th>
            <th className="w-28 border border-black px-2 py-1.5 font-semibold">
              {t('columns.status')}
            </th>
            <th className="w-40 border border-black px-2 py-1.5 font-semibold">
              {t('columns.lastCheck')}
            </th>
            <th className="w-36 border border-black px-2 py-1.5 font-semibold">
              {t('checklist.user')}
            </th>
            <th className="w-14 border border-black px-2 py-1.5 font-semibold">{t('print.check')}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="border border-black px-2 py-1.5" colSpan={6}>
                {t('empty')}
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-2 py-1.5">{index + 1}</td>
                <td className="border border-black px-2 py-1.5">{item.name}</td>
                <td className="border border-black px-2 py-1.5">
                  {item.confirmedOk ? t('status.checked') : t('status.unchecked')}
                </td>
                <td className="border border-black px-2 py-1.5">{formatDateTime(item.confirmedAt)}</td>
                <td className="border border-black px-2 py-1.5">{item.confirmedBy || '—'}</td>
                <td className="border border-black px-2 py-1.5 text-center">
                  <span className="inline-block h-4 w-4 border border-black bg-white" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {axleCount > 0 ? (
        <div className="mt-4 w-full">
          <VehicleChassisOverview
            layout="full"
            plain
            variant={vehicleType === 'car' ? 'truck' : 'trailer'}
            axleCount={axleCount}
            getPositionsForAxle={(index) => getPositions(index)}
            getAxleTitle={(index) => tMaintenance('axle-header', { number: index + 1 })}
            selected={null}
            getSlotState={(axleIndex, position) => {
              const slot = findTireOnAxle(axles, axleIndex, position, getLocation);
              const serial = slot.tire?.serialNumber?.trim();
              return {
                filled: slot.filled,
                hasError: false,
                showCheckbox: true,
                lines: serial ? [serial] : undefined,
              };
            }}
            getPositionLabel={(position) => tMaintenance(POSITION_LABELS[position])}
            onSelect={() => undefined}
          />
        </div>
      ) : null}

      <section className="mt-4">
        <p className="mb-2 font-semibold">{t('print.notes')}</p>
        <div className="border border-black">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-8 border-b border-black last:border-b-0" />
          ))}
        </div>
      </section>
    </div>
  );
});
