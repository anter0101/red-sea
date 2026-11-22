'use client';

import { useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { MultiStepForm, type Step } from '@/components/ui/stepper';
import { PolicyForm } from '@/features/trips/components/policy-from';
import type { ITripPolicyInfo } from '@/features/trips/types/policy';
import { PrintDialog } from '@/features/trips/components/print-dialog';

import type { VehicleMode } from '../enums/vehicle-mode';
import { useCreateJourneyWithPolicy } from '../api/create-journey-with-policy';
import { useOfficeJourneyForm } from '../hooks/use-office-journey-form';
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
} from '../types/office-journey-schema';
import { clearOfficeJourneyDraft, loadOfficeJourneyDraft } from '../utils/office-journey-draft';
import OfficeJourneyStepCustody from './office-journey-step-custody';
import OfficeJourneyStepTrip from './office-journey-step-trip';
import OfficeJourneyStepVehicle from './office-journey-step-vehicle';

interface OfficeJourneyFormProps {
  vehicleMode: VehicleMode;
  /** Admin combined flow: adds a policy step and saves the journey and policy together. */
  withPolicy?: boolean;
}

export default function OfficeJourneyForm({
  vehicleMode,
  withPolicy = false,
}: OfficeJourneyFormProps) {
  const t = useTranslations('office');
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [printJourneyId, setPrintJourneyId] = useState<number | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const draftRestoredRef = useRef(false);

  const handleCreated = (journeyId: number) => {
    setPrintJourneyId(journeyId);
  };

  // Admins go straight from the saved journey to its policy form (one flow, no separate delegation step).
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';

  const handlePrintDialogClose = (open: boolean) => {
    if (!open) {
      const createdId = printJourneyId;
      setPrintJourneyId(null);
      if (withPolicy && createdId) {
        router.push(`/trips/${createdId}`);
        return;
      }
      router.push(isAdmin && createdId ? `/office/policy/${createdId}` : '/office');
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
    transportSuppliers,
    isAdmin: pickCustodyEmployee,
  } = useOfficeJourneyForm(vehicleMode, handleCreated);

  useEffect(() => {
    if (draftRestoredRef.current) return;
    const draft = loadOfficeJourneyDraft(vehicleMode);
    if (!draft) return;
    draftRestoredRef.current = true;
    form.reset({ ...emptyOfficeJourneyValues, ...draft.values, vehicleMode });
    setCurrentStep(Math.min(Math.max(draft.step, 0), 2));
    setRestoredFromDraft(true);
  }, [form, vehicleMode]);

  const lastStep = withPolicy ? 3 : 2;
  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, lastStep));
  const goPrevious = () => {
    if (currentStep === 0) {
      router.push('/office');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const createWithPolicy = useCreateJourneyWithPolicy();

  // Combined flow: the custody step moves on to the policy step instead of saving the journey alone.
  const onStepSubmit = form.handleSubmit(
    () => setCurrentStep(3),
    () => toast.error('يرجى تعبئة الحقول المطلوبة'),
  );

  const submitWithPolicy = (policy: ITripPolicyInfo) => {
    const { journeyId, ...policyFields } = policy;
    void journeyId;
    createWithPolicy.mutate(
      { journey: buildOfficeJourneyPayload(form.getValues()), policy: policyFields },
      {
        onSuccess: (data) => {
          clearOfficeJourneyDraft();
          setPrintJourneyId(data.journey.id);
        },
      },
    );
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
          transportSuppliers={transportSuppliers}
          isSubmitting={isSubmitting}
          restoredFromDraft={restoredFromDraft}
          isAdmin={pickCustodyEmployee}
          onPrevious={goPrevious}
          onSubmit={withPolicy ? onStepSubmit : onSubmit}
        />
      ),
    },
    ...(withPolicy
      ? [
          {
            label: 'البوليصة',
            description: 'بيانات البوليصة وتُحفظ مع الرحلة',
            content: (
              <div className="flex flex-col gap-4" dir="rtl">
                <div>
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    رجوع للعهدة
                  </Button>
                </div>
                <PolicyForm mode="create" vehicleMode={vehicleMode} onPayload={submitWithPolicy} />
              </div>
            ),
          },
        ]
      : []),
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
