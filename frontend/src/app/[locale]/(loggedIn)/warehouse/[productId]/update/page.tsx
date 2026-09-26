import DelegateForm from '@/features/trips/components/delegate-form';
import ProductForm from '@/features/warehouse/components/product-form';
import React from 'react';

export default async function UpdateDelegateForm({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const Id = Number(productId);
  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <ProductForm productId={Id} />
    </div>
  );
}
