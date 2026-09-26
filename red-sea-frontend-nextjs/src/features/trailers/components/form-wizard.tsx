'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MultiStepForm, type Step } from '@/components/ui/stepper';
import { OwnerShipTypes } from '@/enums/ownership';
import { useGetTrailerById } from '@/features/trailers/apis/get-by-id';
import AxleForm from '@/features/trailers/components/axle-form';
import ContractOwnerStep from '@/features/trailers/components/contract-owner-step';
import DocumentsForm from '@/features/trailers/components/documents-form';
import NolonTrailerInformationForm from '@/features/trailers/components/nolon-trailer-information-form';
import OwnershipForm from '@/features/trailers/components/ownership-form';
import OwnershipTypeStep from '@/features/trailers/components/ownership-type-step';
import TrailerInformationForm from '@/features/trailers/components/trailer-information-form';

interface TrailerFormWizardProps {
  id?: number | null;
  step?: number | null;
}

function buildSteps(
  ownerShip: OwnerShipTypes | null,
  ctx: {
    trailerId: number | null;
    contractOwnerId: number | null;
    trailer: ReturnType<typeof useGetTrailerById>['trailer'];
    isTrailerLoading: boolean;
    isEditMode: boolean;
    setOwnerShip: (type: OwnerShipTypes) => void;
    setContractOwnerId: (id: number) => void;
    setTrailerId: (id: number | null) => void;
    setCurrentStep: (fn: (prev: number) => number) => void;
    finishWizard: () => void;
    routerBack: () => void;
  },
): Step[] {
  const typeStep: Step = {
    content: (
      <OwnershipTypeStep
        initialOwnerShip={ownerShip}
        isEditMode={ctx.isEditMode}
        onNext={(type) => {
          ctx.setOwnerShip(type);
          ctx.setCurrentStep((prev) => prev + 1);
        }}
        onPrevious={ctx.routerBack}
      />
    ),
  };

  if (!ownerShip) {
    return [typeStep];
  }

  const infoStep: Step = {
    content:
      ownerShip === OwnerShipTypes.NOLON_CAR ? (
        <NolonTrailerInformationForm
          onFinish={ctx.finishWizard}
          onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
          setTrailerId={ctx.setTrailerId}
          trailer={ctx.trailer}
          isTrailerLoading={ctx.isTrailerLoading}
        />
      ) : (
        <TrailerInformationForm
          ownerShip={ownerShip}
          contractOwnerId={ctx.contractOwnerId}
          onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
          onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
          setTrailerId={ctx.setTrailerId}
          trailer={ctx.trailer}
          isTrailerLoading={ctx.isTrailerLoading}
        />
      ),
  };

  const axleStep: Step = {
    content: (
      <AxleForm
        trailerId={ctx.trailerId}
        trailer={ctx.trailer}
        onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
        isTrailerLoading={ctx.isTrailerLoading}
      />
    ),
  };

  const partnersStep: Step = {
    content: (
      <OwnershipForm
        trailerId={ctx.trailerId}
        trailer={ctx.trailer}
        onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
      />
    ),
  };

  const documentsStep: Step = {
    content: (
      <DocumentsForm
        trailerId={ctx.trailerId}
        trailer={ctx.trailer}
        onNext={ctx.finishWizard}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
      />
    ),
  };

  const contractOwnerStep: Step = {
    content: (
      <ContractOwnerStep
        trailer={ctx.trailer}
        initialOwnerId={ctx.contractOwnerId}
        onNext={(ownerId) => {
          ctx.setContractOwnerId(ownerId);
          ctx.setCurrentStep((prev) => prev + 1);
        }}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
      />
    ),
  };

  const hasContractOwner =
    ctx.isEditMode && (ctx.trailer?.Ownerships?.length ?? 0) > 0;

  switch (ownerShip) {
    case OwnerShipTypes.NOLON_CAR:
      return [typeStep, infoStep];

    case OwnerShipTypes.CONTRACT_CAR:
      return hasContractOwner
        ? [typeStep, infoStep, axleStep, documentsStep]
        : [typeStep, contractOwnerStep, infoStep, axleStep, documentsStep];

    case OwnerShipTypes.COMPANY_CAR:
      return [typeStep, infoStep, axleStep, documentsStep];

    case OwnerShipTypes.SHARE:
      return [typeStep, infoStep, axleStep, partnersStep, documentsStep];

    default:
      return [typeStep];
  }
}

export function TrailerFormWizard({ id, step }: TrailerFormWizardProps) {
  const router = useRouter();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(step ?? 0);
  const [trailerId, setTrailerId] = useState<number | null>(id ?? null);
  const [ownerShip, setOwnerShip] = useState<OwnerShipTypes | null>(null);
  const [contractOwnerId, setContractOwnerId] = useState<number | null>(null);

  const { trailer, isTrailerLoading } = useGetTrailerById(trailerId);

  useEffect(() => {
    if (trailer?.ownerShip && !ownerShip) {
      setOwnerShip(trailer.ownerShip as OwnerShipTypes);
    }
    if (trailer?.Ownerships?.length === 1) {
      const ownerId = trailer.Ownerships[0].ownerId ?? trailer.Ownerships[0].owner?.id;
      if (ownerId) setContractOwnerId(ownerId);
    }
  }, [trailer, ownerShip]);

  const finishWizard = () => router.push('/trailers');
  const routerBack = () => router.back();

  const steps = useMemo(
    () =>
      buildSteps(ownerShip, {
        trailerId,
        contractOwnerId,
        trailer,
        isTrailerLoading,
        isEditMode,
        setOwnerShip,
        setContractOwnerId,
        setTrailerId,
        setCurrentStep,
        finishWizard,
        routerBack,
      }),
    [ownerShip, trailerId, contractOwnerId, trailer, isTrailerLoading, isEditMode],
  );

  const handleStepChange = (stepIndex: number) => {
    if (!isEditMode && stepIndex > 0 && !trailerId) {
      if (ownerShip === OwnerShipTypes.NOLON_CAR) {
        setCurrentStep(stepIndex);
        return;
      }
      const needsTrailerId =
        ownerShip === OwnerShipTypes.CONTRACT_CAR ? stepIndex > 2 : stepIndex > 1;
      if (needsTrailerId) return;
    }
    setCurrentStep(stepIndex);
  };

  const safeCurrentStep = Math.min(currentStep, Math.max(steps.length - 1, 0));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <MultiStepForm
        steps={steps}
        currentStep={safeCurrentStep}
        onStepChange={handleStepChange}
        allowStepClick={
          isEditMode || !!trailerId || ownerShip === OwnerShipTypes.NOLON_CAR
        }
      />
    </div>
  );
}
