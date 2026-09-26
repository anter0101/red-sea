import DriverPageClient from '@/features/drivers/components/driver-page-client';

export default async function DriverPage({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;

  return <DriverPageClient driverId={driverId} />;
}
