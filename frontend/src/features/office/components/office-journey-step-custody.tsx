'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

import type { VehicleMode } from '../enums/vehicle-mode';
import { vehicleModeToSlug } from '../enums/vehicle-mode';
import {
  paysTransportSupplier,
  type OfficeJourneyFormValues,
} from '../types/office-journey-schema';
import { saveOfficeJourneyDraft } from '../utils/office-journey-draft';

interface OfficeJourneyStepCustodyProps {
  form: UseFormReturn<OfficeJourneyFormValues>;
  vehicleMode: VehicleMode;
  officeCustody?: { custodyAmount?: number } | null;
  isCustodyAmountPending: boolean;
  transportSuppliers: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  restoredFromDraft?: boolean;
  onPrevious: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
}

export default function OfficeJourneyStepCustody({
  form,
  vehicleMode,
  officeCustody,
  isCustodyAmountPending,
  transportSuppliers,
  isSubmitting,
  restoredFromDraft = false,
  onPrevious,
  onSubmit,
}: OfficeJourneyStepCustodyProps) {
  const t = useTranslations('office.form');
  const router = useRouter();
  const needsTransportSupplier = paysTransportSupplier(vehicleMode);
  const available = officeCustody?.custodyAmount ?? null;
  const hasNoCustody = !isCustodyAmountPending && available !== null && available <= 0;
  const [askCustodyOpen, setAskCustodyOpen] = useState(false);

  const custodyMessage = restoredFromDraft
    ? t('pendingCustodyDescription')
    : t('noCustodyDescription');

  useEffect(() => {
    if (hasNoCustody) {
      setAskCustodyOpen(true);
      form.setValue('custodyAmount', '');
    } else {
      setAskCustodyOpen(false);
    }
  }, [hasNoCustody, form]);

  const goCreateAskForCustody = () => {
    saveOfficeJourneyDraft({
      vehicleMode,
      step: 2,
      values: form.getValues(),
    });
    const slug = vehicleModeToSlug(vehicleMode);
    router.push(`/office-requests/create?type=ASK_FOR_CUSTODY&returnTo=/office/${slug}`);
  };

  const handleDialogOpenChange = (open: boolean) => {
    // Require creating a custody request — do not dismiss to continue without custody
    if (!open && hasNoCustody) return;
    setAskCustodyOpen(open);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          if (hasNoCustody) {
            e.preventDefault();
            setAskCustodyOpen(true);
            return;
          }
          return onSubmit(e);
        }}
        className="grid grid-cols-1 gap-4"
        dir="rtl"
      >
        <p className="text-sm text-muted-foreground">{t('delegateNumberAutoHint')}</p>

        {hasNoCustody && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">{t('noCustodyTitle')}</p>
            <p className="mt-1 text-muted-foreground dark:text-amber-100/80">{custodyMessage}</p>
            <Button type="button" className="mt-3" variant="secondary" onClick={goCreateAskForCustody}>
              {t('createAskForCustody')}
            </Button>
          </div>
        )}

        {needsTransportSupplier && (
          <div className="flex flex-col gap-1">
            <Label>{t('transportSupplier')}</Label>
            <Select
              value={form.watch('transportSupplierId') || undefined}
              onValueChange={(v) =>
                form.setValue('transportSupplierId', v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('transportSupplierPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {transportSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('transportSupplierHint')}</p>
            {form.formState.errors.transportSupplierId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.transportSupplierId.message as string}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label>{t('custodyAmount')}</Label>
          <Input
            type="number"
            placeholder={
              isCustodyAmountPending ? '...' : String(officeCustody?.custodyAmount ?? '')
            }
            disabled={isCustodyAmountPending || hasNoCustody}
            {...form.register('custodyAmount')}
          />
          {form.formState.errors.custodyAmount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.custodyAmount.message as string}
            </p>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t('previous')}
          </Button>
          <Button type="submit" disabled={isSubmitting || hasNoCustody}>
            {t('save')}
          </Button>
        </div>
      </form>

      <AlertDialog open={askCustodyOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('noCustodyTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{custodyMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={onPrevious}>
              {t('previous')}
            </Button>
            <AlertDialogAction onClick={goCreateAskForCustody}>
              {t('createAskForCustody')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
