'use client';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { VehicleMode } from '../enums/vehicle-mode';
import type { OfficeJourneyFormValues } from '../types/office-journey-schema';
import AssetSelectOrCreate from './inline-create/asset-select-or-create';

interface OfficeJourneyStepVehicleProps {
  form: UseFormReturn<OfficeJourneyFormValues>;
  vehicleMode: VehicleMode;
  cars: Array<{ id: string | number; carCode?: string; model?: string }>;
  trailers: Array<{
    id: string | number;
    code?: string;
    plateLetters?: string;
    plateNumber?: string;
  }>;
  drivers: Array<{ id: string | number; driverName?: string }>;
  driverAssistants: Array<{ id: string | number; assistantName?: string }>;
  isGetDriverAssistantsPending: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function OfficeJourneyStepVehicle({
  form,
  vehicleMode,
  cars,
  trailers,
  drivers,
  driverAssistants,
  isGetDriverAssistantsPending,
  onNext,
  onPrevious,
}: OfficeJourneyStepVehicleProps) {
  const t = useTranslations('office');
  const isNolon = vehicleMode === 'NOLON_CAR';

  const handleNext = async () => {
    const ok = await form.trigger(['carId']);
    const values = form.getValues();
    if (!ok || (!values.carId && !values.carInline)) {
      if (!values.carId && !values.carInline) {
        form.setError('carId', { message: 'السيارة مطلوبة' });
      }
      return;
    }
    onNext();
  };

  return (
    <div className="grid grid-cols-1 gap-4" dir="rtl">
      <div className="flex flex-col gap-1">
        <AssetSelectOrCreate
          form={form}
          label={t('form.car')}
          required
          isNolon={isNolon}
          idField="carId"
          inlineField="carInline"
          items={cars.map((c) => ({
            id: String(c.id),
            name: `${c.carCode ?? ''} - ${c.model ?? ''}`.trim(),
          }))}
          createFields={[
            { name: 'plateLetters', label: t('form.plateLetters') },
            { name: 'plateNumber', label: t('form.plateNumber') },
            { name: 'licenseNumber', label: t('form.licenseNumber') },
            { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
          ]}
        />
        {form.formState.errors.carId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.carId.message as string}
          </p>
        )}
      </div>

      <AssetSelectOrCreate
        form={form}
        label={t('form.trailer')}
        isNolon={isNolon}
        idField="trailerId"
        inlineField="trailerInline"
        items={trailers.map((tr) => ({
          id: String(tr.id),
          name:
            [tr.code, tr.plateLetters, tr.plateNumber].filter(Boolean).join(' - ') || String(tr.id),
        }))}
        createFields={[
          { name: 'plateLetters', label: t('form.plateLetters') },
          { name: 'plateNumber', label: t('form.plateNumber') },
          { name: 'licenseNumber', label: t('form.licenseNumber') },
          { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
        ]}
      />

      <AssetSelectOrCreate
        form={form}
        label={t('form.driver')}
        isNolon={isNolon}
        idField="driverId"
        inlineField="driverInline"
        items={drivers.map((d) => ({ id: String(d.id), name: d.driverName ?? String(d.id) }))}
        createFields={[
          { name: 'user.firstName', label: t('form.firstName') },
          { name: 'user.lastName', label: t('form.lastName') },
          { name: 'user.nationalId', label: t('form.nationalId') },
          { name: 'user.phoneNumber', label: t('form.phoneNumber') },
          { name: 'licenseNumber', label: t('form.licenseNumber') },
          { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
        ]}
      />

      <div className="flex flex-col gap-1">
        <Label>{t('form.assistant')}</Label>
        <Select
          value={form.watch('driverAssistantId') ?? ''}
          onValueChange={(v) => form.setValue('driverAssistantId', v ?? '')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('form.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {isGetDriverAssistantsPending ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">...</div>
            ) : driverAssistants.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">لا يوجد تابع</div>
            ) : (
              driverAssistants.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.assistantName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          {t('form.previous')}
        </Button>
        <Button type="button" onClick={handleNext}>
          {t('form.next')}
        </Button>
      </div>
    </div>
  );
}
