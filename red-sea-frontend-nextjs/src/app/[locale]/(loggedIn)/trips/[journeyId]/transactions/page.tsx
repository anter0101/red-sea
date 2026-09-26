import { TransactionsForm } from '@/features/trips/components/transactions-form';
import React from 'react';

export default async function CreateTripActivityPage({
  params,
}: {
  params: Promise<{ lang: string; journeyId: string }>;
}) {
  const { journeyId } = await params;

  const id = Number(journeyId);

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <TransactionsForm journeyId={id} />
    </div>
  );
}
