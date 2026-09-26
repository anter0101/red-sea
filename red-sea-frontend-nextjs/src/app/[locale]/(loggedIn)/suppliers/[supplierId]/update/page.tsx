'use client';

import { useParams } from 'next/navigation';

import { SupplierForm } from '@/features/suppliers/components/supplier-form';
import { useGetOneSupplier } from '@/features/suppliers/api/get-one';

export default function UpdateSupplierPage() {
  const params = useParams();
  const supplierId = params.supplierId as string;

  const { supplier, isGetSupplierPending } = useGetOneSupplier(Number(supplierId));

  if (isGetSupplierPending) {
    return <div className="p-4 container mx-auto max-w-4xl">Loading...</div>;
  }

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <SupplierForm supplier={supplier} />
    </div>
  );
}
