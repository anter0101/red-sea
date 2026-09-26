import CarPageClient from '@/features/cars/components/car-page-client';

export default async function DriverAssistantPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;

  return <CarPageClient carId={carId} />;
}
