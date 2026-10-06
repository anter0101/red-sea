'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PackingType } from '@/features/clients/enums/packing-type';
import { PricingSheetKind } from '@/features/clients/enums/pricing-sheet-kind';

import type { OfficeJourneyFormValues } from '../types/office-journey-schema';

interface OfficeJourneyStepTripProps {
  form: UseFormReturn<OfficeJourneyFormValues>;
  clients: Array<{ id?: number; name?: string; pricingSheetKind?: PricingSheetKind | string }>;
  onNext: () => void;
  onPrevious: () => void;
}

export default function OfficeJourneyStepTrip({
  form,
  clients,
  onNext,
  onPrevious,
}: OfficeJourneyStepTripProps) {
  const t = useTranslations('office');
  const [clientOpen, setClientOpen] = useState(false);
  const clientId = form.watch('clientId');

  const selectedClient = useMemo(
    () => clients.find((c) => c.id != null && String(c.id) === clientId),
    [clients, clientId],
  );
  const isArish = selectedClient?.pricingSheetKind === PricingSheetKind.ARISH;
  const packingOptions = useMemo(
    () => (isArish || !selectedClient ? Object.values(PackingType) : [PackingType.LOOSE]),
    [isArish, selectedClient],
  );

  useEffect(() => {
    if (!selectedClient) return;
    if (isArish) return;
    const current = form.getValues('packingType');
    if (current !== PackingType.LOOSE) {
      form.setValue('packingType', PackingType.LOOSE, { shouldValidate: true });
    }
  }, [selectedClient, isArish, form]);

  useEffect(() => {
    if (!selectedClient || !isArish) return;
    const current = form.getValues('packingType');
    if (current && !Object.values(PackingType).includes(current as PackingType)) {
      form.setValue('packingType', '', { shouldValidate: true });
    }
  }, [selectedClient, isArish, form]);

  const Field = ({
    label,
    name,
    required,
  }: {
    label: string;
    name: keyof OfficeJourneyFormValues;
    required?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <Label>
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </Label>
      <Input {...form.register(name as never)} />
    </div>
  );

  const handleNext = async () => {
    const ok = await form.trigger(['clientId']);
    if (!ok) return;
    onNext();
  };

  return (
    <div className="grid grid-cols-1 gap-4" dir="rtl">
      <Field label={t('form.sellingOrderNo')} name="sellingOrderNo" />

      <div className="flex flex-col gap-1">
        <Label>
          {t('form.client')} <span className="text-destructive">*</span>
        </Label>
        <SelectWithActions
          open={clientOpen}
          setOpen={setClientOpen}
          value={form.watch('clientId')}
          items={clients
            .filter((c) => c.id != null)
            .map((c) => ({ id: String(c.id), name: c.name ?? String(c.id) }))}
          handleSelect={(v) => form.setValue('clientId', v ?? '', { shouldValidate: true })}
          handleLoadMore={() => {}}
          showSearch
          placeholder={t('form.selectPlaceholder')}
        />
        {form.formState.errors.clientId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.clientId.message as string}
          </p>
        )}
      </div>

      <Field label={t('form.direction')} name="direction" />
      <Field label={t('form.receivedCompany')} name="receivedCompany" />

      <div className="flex flex-col gap-1">
        <Label>{t('form.packingType')}</Label>
        <Select
          value={form.watch('packingType')}
          onValueChange={(v) => form.setValue('packingType', v)}
          disabled={!selectedClient && packingOptions.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('form.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {packingOptions.map((pt) => (
              <SelectItem key={pt} value={pt}>
                {t(`packing.${pt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Field label={t('form.cementGrade')} name="cementGrade" />
      <Field label={t('form.quantity')} name="quantity" />

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
