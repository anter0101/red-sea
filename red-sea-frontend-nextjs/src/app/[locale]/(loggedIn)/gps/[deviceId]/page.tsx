import DeviceClientPage from '@/features/gps-devices/components/device-client-page';

export default async function DevicePage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params;

  return <DeviceClientPage deviceId={deviceId} />;
}
