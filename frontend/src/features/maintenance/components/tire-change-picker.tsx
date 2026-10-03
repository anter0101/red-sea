'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  findTireOnAxle,
  VehicleChassisOverview,
  type SelectedTire,
  type TirePositionKey,
} from '@/components/common/axle-overview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TireModelDropdown from '@/features/cars/components/tire-model-dropdown';
import {
  getApiLocationCode as carLocation,
  getTirePositionsForAxle as carPositions,
} from '@/features/cars/utils/location-mapping';
import {
  getApiLocationCode as trailerLocation,
  getTirePositionsForAxle as trailerPositions,
} from '@/features/trailers/utils/location-mapping';
import type { IAxle } from '@/types/axles';

import type { ITireSelection, ITireSnapshot } from '../api/get-list';

type VehicleType = 'car' | 'trailer';

type Props = {
  vehicleType: VehicleType;
  axles: IAxle[];
  axleCount: number;
  selected: ITireSelection[];
  onChange: (next: ITireSelection[]) => void;
};

const POSITION_LABELS: Record<TirePositionKey, string> = {
  leftOuter: 'positions.left-outer',
  leftInner: 'positions.left-inner',
  rightOuter: 'positions.right-outer',
  rightInner: 'positions.right-inner',
};

function selectionKey(axleNumber: number, position: string) {
  return `${axleNumber}:${position}`;
}

function snapshotFromTire(tire?: {
  serialNumber?: string;
  type?: string;
  healthPercentage?: string;
  createdDate?: string;
}): ITireSnapshot {
  return {
    serialNumber: tire?.serialNumber ?? '',
    type: tire?.type ?? '',
    healthPercentage: tire?.healthPercentage ?? '',
    createdDate: tire?.createdDate ? String(tire.createdDate).slice(0, 10) : '',
  };
}

function displayValue(value: string | undefined, empty: string) {
  const text = value?.trim();
  return text ? text : empty;
}

export default function TireChangePicker({
  vehicleType,
  axles,
  axleCount,
  selected,
  onChange,
}: Props) {
  const t = useTranslations('maintenance');
  const getPositions = vehicleType === 'car' ? carPositions : trailerPositions;
  const getLocation = vehicleType === 'car' ? carLocation : trailerLocation;
  const [active, setActive] = useState<SelectedTire | null>(null);

  const selectedKeys = useMemo(
    () => new Set(selected.map((item) => selectionKey(item.axleNumber, item.position))),
    [selected],
  );

  const hasFilledTire = useMemo(() => {
    for (let axleIndex = 0; axleIndex < axleCount; axleIndex += 1) {
      const filled = getPositions(axleIndex).some(
        (position) => findTireOnAxle(axles, axleIndex, position, getLocation).filled,
      );
      if (filled) return true;
    }
    return false;
  }, [axleCount, axles, getLocation, getPositions]);

  const activeSlot =
    active == null ? null : findTireOnAxle(axles, active.axleIndex, active.positionKey, getLocation);
  const activeItem =
    activeSlot == null
      ? undefined
      : selected.find(
          (item) => selectionKey(item.axleNumber, item.position) === selectionKey(activeSlot.axleNumber, active!.positionKey),
        );
  const previous = activeItem?.previous ?? snapshotFromTire(activeSlot?.tire);
  const nextValues = activeItem?.next ?? previous;

  const updateNext = (patch: Partial<ITireSnapshot>) => {
    if (!activeSlot || !active) return;
    const key = selectionKey(activeSlot.axleNumber, active.positionKey);
    onChange(
      selected.map((item) =>
        selectionKey(item.axleNumber, item.position) === key
          ? { ...item, next: { ...(item.next ?? previous), ...patch } }
          : item,
      ),
    );
  };

  if (axleCount < 1 || !hasFilledTire) {
    return <p className="text-sm text-muted-foreground">{t('no-tires')}</p>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="h-80">
        <VehicleChassisOverview
          variant={vehicleType === 'car' ? 'truck' : 'trailer'}
          axleCount={axleCount}
          getPositionsForAxle={(index) => getPositions(index)}
          getAxleTitle={(index) => t('axle-header', { number: index + 1 })}
          selected={active}
          getSlotState={(axleIndex, position) => {
            const slot = findTireOnAxle(axles, axleIndex, position, getLocation);
            const isSelected = selectedKeys.has(selectionKey(slot.axleNumber, position));
            return {
              filled: slot.filled,
              hasError: false,
              selected: isSelected,
              disabled: !slot.filled,
            };
          }}
          getPositionLabel={(position) => t(POSITION_LABELS[position])}
          onSelect={({ axleIndex, positionKey }) => {
            const slot = findTireOnAxle(axles, axleIndex, positionKey, getLocation);
            if (!slot.tire) return;
            const key = selectionKey(slot.axleNumber, positionKey);
            const snap = snapshotFromTire(slot.tire);
            const existing = selected.find((item) => selectionKey(item.axleNumber, item.position) === key);
            if (!existing) {
              onChange([
                ...selected,
                {
                  axleNumber: slot.axleNumber,
                  position: positionKey,
                  tireId: slot.tire.id,
                  location: slot.location,
                  previous: snap,
                  next: { ...snap },
                },
              ]);
            } else if (!existing.next) {
              onChange(
                selected.map((item) =>
                  selectionKey(item.axleNumber, item.position) === key
                    ? { ...item, previous: item.previous ?? snap, next: { ...snap } }
                    : item,
                ),
              );
            }
            setActive({ axleIndex, positionKey });
          }}
          hint={t('tire-hint')}
        />
      </div>

      {active && activeItem ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">
                {t('axle-header', { number: activeSlot?.axleNumber ?? active.axleIndex + 1 })}
                {' · '}
                {t(POSITION_LABELS[active.positionKey])}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const key = selectionKey(activeSlot?.axleNumber ?? active.axleIndex + 1, active.positionKey);
                onChange(selected.filter((item) => selectionKey(item.axleNumber, item.position) !== key));
                setActive(null);
              }}
            >
              {t('tire-editor.remove')}
            </Button>
          </div>

          <div className="rounded-md bg-muted/60 p-3 text-sm">
            <p className="mb-2 font-medium">{t('tire-editor.previous')}</p>
            <p>
              {t('tire-editor.serial')}: {displayValue(previous.serialNumber, t('tire-editor.empty'))}
            </p>
            <p>
              {t('tire-editor.type')}: {displayValue(previous.type, t('tire-editor.empty'))}
            </p>
            <p>
              {t('tire-editor.thickness')}: {displayValue(previous.healthPercentage, t('tire-editor.empty'))}
              {previous.healthPercentage?.trim() ? '%' : ''}
            </p>
            <p>
              {t('tire-editor.installed')}: {displayValue(previous.createdDate, t('tire-editor.empty'))}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t('tire-editor.next')}</p>
            <div className="flex flex-col gap-1.5">
              <Label>{t('tire-editor.serial')}</Label>
              <Input
                value={nextValues.serialNumber}
                onChange={(event) => updateNext({ serialNumber: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('tire-editor.type')}</Label>
              <TireModelDropdown
                value={nextValues.type || undefined}
                onChange={(value) => updateNext({ type: value ?? '' })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('tire-editor.thickness')}</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={nextValues.healthPercentage}
                onChange={(event) => updateNext({ healthPercentage: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('tire-editor.installed')}</Label>
              <Input
                type="date"
                value={nextValues.createdDate ?? ''}
                onChange={(event) => updateNext({ createdDate: event.target.value })}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          {t('tire-pick')}
        </div>
      )}
    </div>
  );
}
