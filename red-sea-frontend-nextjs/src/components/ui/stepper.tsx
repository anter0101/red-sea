import * as React from 'react';

import { cn } from '@/lib/utils';

export type StepLabel = {
  label?: string;
  description?: string;
};

export type Step = StepLabel & {
  content: React.ReactNode;
};

export type StepperProps = {
  steps: StepLabel[];
  currentStep: number;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
};

function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <div data-slot="stepper" className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div
              className={cn('flex flex-col items-center gap-1', onStepClick && 'cursor-pointer')}
              onClick={() => onStepClick?.(index)}
            >
              {/* Step Indicator */}
              <div
                className={cn(
                  'relative flex items-center justify-center',
                  'size-8 rounded-full border-2 transition-all',
                  isActive && 'border-primary-400 bg-primary-50 dark:bg-primary-950/30',
                  isCompleted && 'border-primary-400 bg-primary-400 dark:bg-primary-500',
                  !isActive && !isCompleted && 'border-primary-300 bg-transparent',
                )}
              >
                {/* Active Step - Filled Dot */}
                {isActive && (
                  <div className="size-3 rounded-full bg-primary-600 dark:bg-primary-500" />
                )}
                {/* Completed Step - Checkmark or Step Number */}
                {isCompleted && (
                  <svg
                    className="size-4 text-white dark:text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {/* Inactive Step - Step Number */}
                {!isActive && !isCompleted && (
                  <span
                    className={cn(
                      'text-sm font-medium p-1',
                      'text-primary-400 dark:text-primary-500',
                    )}
                  >
                    {' '}
                    <span className="size-2 rounded-full bg-primary-400 dark:bg-primary-500" />
                    {/* {index + 1} */}
                  </span>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 flex-1 transition-colors',
                  isCompleted
                    ? 'bg-primary-400 dark:bg-primary-500'
                    : 'bg-primary-300 dark:bg-primary-800',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export type MultiStepFormProps = {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  allowStepClick?: boolean;
  stepperClassName?: string;
  contentClassName?: string;
  className?: string;
};

function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  allowStepClick = true,
  stepperClassName,
  contentClassName,
  className,
}: MultiStepFormProps) {
  const handleStepClick = (stepIndex: number) => {
    if (allowStepClick && onStepChange) {
      onStepChange(stepIndex);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div data-slot="multi-step-form" className={cn('flex flex-col gap-8', className)}>
      {/* Stepper */}
      <Stepper
        steps={steps.map(({ label, description }) => ({ label, description }))}
        currentStep={currentStep}
        onStepClick={allowStepClick ? handleStepClick : undefined}
        className={stepperClassName}
      />

      {/* Step Content */}
      <div data-slot="step-content" className={cn('flex-1', contentClassName)}>
        {currentStepData?.content}
      </div>
    </div>
  );
}

export { MultiStepForm, Stepper };
