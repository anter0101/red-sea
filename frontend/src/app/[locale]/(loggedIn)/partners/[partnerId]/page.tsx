import PartnerPageClient from '@/features/partners/components/client-page';

export default async function PartnerPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  return <PartnerPageClient partnerId={partnerId} />;
}
