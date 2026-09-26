import { notFound } from 'next/navigation';

import OfficePolicyEntry from '@/features/office/components/office-policy-entry';

interface PageProps {
  params: Promise<{ journeyId: string }>;
}

export default async function OfficePolicyJourneyPage({ params }: PageProps) {
  const { journeyId } = await params;
  const id = Number(journeyId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return <OfficePolicyEntry journeyId={id} />;
}
