import { notFound } from 'next/navigation';

import OfficeJourneyForm from '@/features/office/components/office-journey-form';
import { slugToVehicleMode } from '@/features/office/enums/vehicle-mode';

interface PageProps {
  params: Promise<{ mode: string; locale: string }>;
}

export default async function OfficeModePage({ params }: PageProps) {
  const { mode } = await params;
  const vehicleMode = slugToVehicleMode(mode);
  if (!vehicleMode) notFound();
  return (
    <div className="container mx-auto max-w-3xl">
      <OfficeJourneyForm vehicleMode={vehicleMode} />
    </div>
  );
}
