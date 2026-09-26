import TripClientPage from '@/features/trips/components/trip-client-page';
import React from 'react';

export default async function TripPage({ params }: { params: Promise<{ journeyId: string }> }) {
  const { journeyId } = await params;
  const Id = Number(journeyId);
  return <TripClientPage journeyId={Id} />;
}
