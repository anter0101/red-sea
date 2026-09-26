'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useGetUser } from '@/apis/users/get-one';
import { MultiStepForm, type Step } from '@/components/ui/stepper';
import DriverAssistantAttachmentsForm from '@/features/driver-assistants/components/attachments-form';
import DriverPersonalInformation from '@/features/driver-assistants/components/personal-information';
import DriverSalaryForm from '@/features/driver-assistants/components/salary-step-form';

export function DriverAssistantFormStepper({ id }: { id?: number | null }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [driverAssistantId, setDriverAssistantId] = useState<number | null>(id ?? null);
  const { user, isGetUserLoading } = useGetUser(driverAssistantId, !!driverAssistantId);

  const steps: Step[] = [
    {
      content: (
        <DriverPersonalInformation
          driverAssistant={user}
          setDriverAssistantId={setDriverAssistantId}
          onPrevious={() => router.back()}
          isGetUserLoading={isGetUserLoading}
          onNext={() => setCurrentStep((prev) => prev + 1)}
        />
      ),
    },
    // {
    //   content: (
    //     <DriverAssistantContactForm
    //       onNext={() => setCurrentStep((prev) => prev + 1)}
    //       onPrevious={() => {
    //         setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0));
    //       }}
    //       driverAssistant={user}
    //     />
    //   ),
    // },
    {
      content: (
        <DriverAssistantAttachmentsForm
          onNext={() => setCurrentStep((prev) => prev + 1)}
          onPrevious={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0))}
        />
      ),
    },
    {
      content: (
        <DriverSalaryForm
          onNext={() => router.push('/driver-assistants')}
          onPrevious={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0))}
          driverAssistant={user}
        />
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <MultiStepForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        allowStepClick
      />
    </div>
  );
}
