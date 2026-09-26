import { PolicyForm } from '@/features/trips/components/policy-from';
import React from 'react';

export default async function UpdatePolicyPage({
  params,
}: {
  params: Promise<{ locale: string; journeyId: string }>;
}) {
  const { journeyId } = await params;
  const id = Number(journeyId);

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <PolicyForm journeyId={id} mode="update" />
    </div>
  );
}
