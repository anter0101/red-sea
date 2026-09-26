import SupplierPageClient from '@/features/suppliers/components/supplier-page-client';

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;

  return <SupplierPageClient supplierId={supplierId} />;
}
