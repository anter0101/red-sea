import React from 'react';

import { DriverAssistantFormStepper } from '@/features/driver-assistants/components/form-stepper';

interface PageProps {
  params: Promise<{ assistantId: string }>;
}

const UpdateDriverAssistantPage = async ({ params }: PageProps) => {
  const { assistantId } = await params;
  const id = typeof assistantId === 'string' ? parseInt(assistantId) : null;

  return (
    <div>
      <DriverAssistantFormStepper id={id} />
    </div>
  );
};

export default UpdateDriverAssistantPage;
