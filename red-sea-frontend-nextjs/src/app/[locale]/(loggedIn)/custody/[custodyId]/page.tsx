import CustodyDetail from '@/features/custody/components/custody-detail';

interface PageProps {
  params: Promise<{ custodyId: string; locale: string }>;
}

export default async function CustodyDetailPage({ params }: PageProps) {
  const { custodyId } = await params;
  return (
    <div className="container mx-auto">
      <CustodyDetail custodyId={Number(custodyId)} />
    </div>
  );
}
