'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { MultiStepForm, type Step } from '@/components/ui/stepper';
import { PrintDialog } from '@/features/trips/components/print-dialog';

import type { VehicleMode } from '../enums/vehicle-mode';
import { useOfficeJourneyForm } from '../hooks/use-office-journey-form';
import { loadOfficeJourneyDraft } from '../utils/office-journey-draft';
import OfficeJourneyStepCustody from './office-journey-step-custody';
import OfficeJourneyStepTrip from './office-journey-step-trip';
import OfficeJourneyStepVehicle from './office-journey-step-vehicle';

interface OfficeJourneyFormProps {
  vehicleMode: VehicleMode;
}

export default function OfficeJourneyForm({ vehicleMode }: OfficeJourneyFormProps) {
  const t = useTranslations('office');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [printJourneyId, setPrintJourneyId] = useState<number | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const draftRestoredRef = useRef(false);

  const handleCreated = (journeyId: number) => {
    setPrintJourneyId(journeyId);
  };

  const handlePrintDialogClose = (open: boolean) => {
    if (!open) {
      setPrintJourneyId(null);
      router.push('/office');
    }
  };

  const {
    form,
    onSubmit,
    isSubmitting,
    cars,
    trailers,
    drivers,
    clients,
    officeCustody,
    isCustodyAmountPending,
    driverAssistants,
    isGetDriverAssistantsPending,
  } = useOfficeJourneyForm(vehicleMode, handleCreated);

  useEffect(() => {
    if (draftRestoredRef.current) return;
    const draft = loadOfficeJourneyDraft(vehicleMode);
    if (!draft) return;
    draftRestoredRef.current = true;
    form.reset({ ...draft.values, vehicleMode });
    setCurrentStep(Math.min(Math.max(draft.step, 0), 2));
    setRestoredFromDraft(true);
  }, [form, vehicleMode]);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const goPrevious = () => {
    if (currentStep === 0) {
      router.push('/office');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const steps: Step[] = [
    {
      label: t('steps.vehicle'),
      description: t('steps.vehicleDescription'),
      content: (
        <OfficeJourneyStepVehicle
          form={form}
          vehicleMode={vehicleMode}
          cars={cars}
          trailers={trailers}
          drivers={drivers}
          driverAssistants={driverAssistants}
          isGetDriverAssistantsPending={isGetDriverAssistantsPending}
          onNext={goNext}
          onPrevious={goPrevious}
        />
      ),
    },
    {
      label: t('steps.trip'),
      description: t('steps.tripDescription'),
      content: (
        <OfficeJourneyStepTrip
          form={form}
          clients={clients}
          onNext={goNext}
          onPrevious={goPrevious}
        />
      ),
    },
    {
      label: t('steps.custody'),
      description: t('steps.custodyDescription'),
      content: (
        <OfficeJourneyStepCustody
          form={form}
          vehicleMode={vehicleMode}
          officeCustody={officeCustody}
          isCustodyAmountPending={isCustodyAmountPending}
          isSubmitting={isSubmitting}
          restoredFromDraft={restoredFromDraft}
          onPrevious={goPrevious}
          onSubmit={onSubmit}
        />
      ),
    },
  ];

  return (
    <>
      <MultiStepForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        allowStepClick={false}
        className="w-full"
      />

      {printJourneyId !== null && (
        <PrintDialog open={true} onOpenChange={handlePrintDialogClose} journeyId={printJourneyId} />
      )}
    </>
  );
}
