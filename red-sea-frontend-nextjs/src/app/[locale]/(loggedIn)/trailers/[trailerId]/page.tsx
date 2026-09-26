import React from 'react';

import TrailerPageClient from '@/features/trailers/components/trailer-page-client';

export default async function TrailerPage({ params }: { params: Promise<{ trailerId: string }> }) {
  const { trailerId } = await params;
  return <TrailerPageClient trailerId={trailerId} />;
}
