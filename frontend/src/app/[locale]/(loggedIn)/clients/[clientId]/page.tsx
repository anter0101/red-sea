import ClientPageClient from '@/features/clients/components/client-page-client';

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  return <ClientPageClient clientId={clientId} />;
}
