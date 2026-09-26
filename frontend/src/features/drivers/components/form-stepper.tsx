'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { MultiStepForm, type Step } from '@/components/ui/stepper';
import { useGetDriver } from '@/features/drivers/api/get-one';
import DriverAttachmentsForm from '@/features/drivers/components/attachments-form';
import DriverContactForm from '@/features/drivers/components/contact-form';
import DriverPersonalInformation from '@/features/drivers/components/personal-information';
import DriverSalaryForm from '@/features/drivers/components/salary-step-form';

export function ExampleMultiStepForm({ id }: { id?: number | null }) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [driverId, setDriverId] = useState<number | null>(id ?? null);
  const { driver, isGetDriverLoading } = useGetDriver(driverId, !!driverId);

  const steps: Step[] = [
    {
      content: (
        <DriverPersonalInformation
          driver={driver}
          setDriverId={setDriverId}
          onPrevious={() => router.back()}
          isGetDriverLoading={isGetDriverLoading}
          onNext={() => setCurrentStep((prev) => prev + 1)}
        />
      ),
    },
    // {
    //   content: (
    //     <DriverContactForm
    //       onNext={() => setCurrentStep((prev) => prev + 1)}
    //       onPrevious={() => {
    //         setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0));
    //       }}
    //       driver={driver}
    //     />
    //   ),
    // },
    {
      content: (
        <DriverAttachmentsForm
          onNext={() => setCurrentStep((prev) => prev + 1)}
          onPrevious={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0))}
          // driver={driver}
        />
      ),
    },
    {
      content: (
        <DriverSalaryForm
          onNext={() => router.push('/drivers')}
          onPrevious={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0))}
          driver={driver}
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
        allowStepClick={true}
      />
    </div>
  );
}
