import ProductClientPage from '@/features/warehouse/components/product-client-page';

export default async function TripPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const Id = Number(productId);
  return <ProductClientPage productId={Id} />;
}
