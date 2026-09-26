'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MultiStepForm, type Step } from '@/components/ui/stepper';
import { OwnerShipTypes } from '@/enums/ownership';
import { useGetCarById } from '@/features/cars/apis/get-by-id';
import AxleForm from '@/features/cars/components/axle-form';
import CarInformationForm from '@/features/cars/components/car-information-form';
import NolonCarInformationForm from '@/features/cars/components/nolon-car-information-form';
import ContractOwnerStep from '@/features/cars/components/contract-owner-step';
import DocumentsForm from '@/features/cars/components/documents-form';
import OwnershipForm from '@/features/cars/components/ownership-form';
import OwnershipTypeStep from '@/features/cars/components/ownership-type-step';

interface CarFormWizardProps {
  id?: number | null;
  step?: number | null;
}

function buildSteps(
  ownerShip: OwnerShipTypes | null,
  ctx: {
    carId: number | null;
    contractOwnerId: number | null;
    car: ReturnType<typeof useGetCarById>['car'];
    isCarLoading: boolean;
    isEditMode: boolean;
    setOwnerShip: (type: OwnerShipTypes) => void;
    setContractOwnerId: (id: number) => void;
    setCarId: (id: number | null) => void;
    setCurrentStep: (fn: (prev: number) => number) => void;
    goToStep: (step: number) => void;
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
        <NolonCarInformationForm
          onFinish={ctx.finishWizard}
          onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
          setCarId={ctx.setCarId}
          car={ctx.car}
          isCarLoading={ctx.isCarLoading}
        />
      ) : (
        <CarInformationForm
          ownerShip={ownerShip}
          contractOwnerId={ctx.contractOwnerId}
          onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
          onFinish={ctx.finishWizard}
          onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
          setCarId={ctx.setCarId}
          car={ctx.car}
          isCarLoading={ctx.isCarLoading}
        />
      ),
  };

  const axleStep: Step = {
    content: (
      <AxleForm
        carId={ctx.carId}
        car={ctx.car}
        onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
        isCarLoading={ctx.isCarLoading}
      />
    ),
  };

  const partnersStep: Step = {
    content: (
      <OwnershipForm
        carId={ctx.carId}
        car={ctx.car}
        onNext={() => ctx.setCurrentStep((prev) => prev + 1)}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
      />
    ),
  };

  const documentsStep: Step = {
    content: (
      <DocumentsForm
        carId={ctx.carId}
        car={ctx.car}
        onNext={ctx.finishWizard}
        onPrevious={() => ctx.setCurrentStep((prev) => prev - 1)}
      />
    ),
  };

  const contractOwnerStep: Step = {
    content: (
      <ContractOwnerStep
        car={ctx.car}
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
    ctx.isEditMode && (ctx.car?.Ownerships?.length ?? 0) > 0;

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

export function CarFormWizard({ id, step }: CarFormWizardProps) {
  const router = useRouter();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(step ?? 0);
  const [carId, setCarId] = useState<number | null>(id ?? null);
  const [ownerShip, setOwnerShip] = useState<OwnerShipTypes | null>(null);
  const [contractOwnerId, setContractOwnerId] = useState<number | null>(null);

  const { car, isCarLoading } = useGetCarById(carId);

  useEffect(() => {
    if (car?.ownerShip && !ownerShip) {
      setOwnerShip(car.ownerShip as OwnerShipTypes);
    }
    if (car?.Ownerships?.length === 1) {
      const ownerId = car.Ownerships[0].ownerId ?? car.Ownerships[0].owner?.id;
      if (ownerId) setContractOwnerId(ownerId);
    }
  }, [car, ownerShip]);

  const finishWizard = () => router.push('/cars');
  const routerBack = () => router.back();

  const steps = useMemo(
    () =>
      buildSteps(ownerShip, {
        carId,
        contractOwnerId,
        car,
        isCarLoading,
        isEditMode,
        setOwnerShip,
        setContractOwnerId,
        setCarId,
        setCurrentStep,
        goToStep: setCurrentStep,
        finishWizard,
        routerBack,
      }),
    [
      ownerShip,
      carId,
      contractOwnerId,
      car,
      isCarLoading,
      isEditMode,
    ],
  );

  const handleStepChange = (stepIndex: number) => {
    if (!isEditMode && stepIndex > 0 && !carId && ownerShip !== OwnerShipTypes.NOLON_CAR) {
      const needsCarId =
        ownerShip === OwnerShipTypes.CONTRACT_CAR
          ? stepIndex > 2
          : stepIndex > 1;
      if (needsCarId) return;
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
        allowStepClick={isEditMode || !!carId || ownerShip === OwnerShipTypes.NOLON_CAR}
      />
    </div>
  );
}
