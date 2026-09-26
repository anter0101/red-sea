import DelegateForm from '@/features/trips/components/delegate-form';
import React from 'react';

export default async function UpdateDelegateForm({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;

  const Id = Number(journeyId);
  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <DelegateForm journeyId={Id} />
    </div>
  );
}
