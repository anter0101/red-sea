import CustodyForm from '@/features/custody/components/custody-form';

interface PageProps {
  params: Promise<{ custodyId: string }>;
}

export default async function UpdateCustodyPage({ params }: PageProps) {
  const { custodyId } = await params;
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <CustodyForm id={Number(custodyId)} />
    </div>
  );
}
