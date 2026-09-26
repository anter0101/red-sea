import CreateDeliveryPricesPageClient from '@/features/clients/components/create-delivery-prices-page-client';

export default async function CreateDeliveryPricesPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <CreateDeliveryPricesPageClient clientId={clientId} />;
}
