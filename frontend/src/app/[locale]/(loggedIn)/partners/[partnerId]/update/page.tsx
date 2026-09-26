'use client';

import { useParams } from 'next/navigation';

import Loader from '@/components/common/loader';
import { useGetOnePartner } from '@/features/partners/api/get-one';
import PartnerPageClient from '@/features/partners/components/client-page';
import { PartnerForm } from '@/features/partners/components/form';

export default function PartnerPage() {
  const params = useParams();
  const partnerId = params.partnerId as string;
  const { partner, isGetPartnerPending } = useGetOnePartner(Number(partnerId));

  if (isGetPartnerPending) {
    return <Loader />;
  }

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <PartnerForm partner={partner} />
    </div>
  );
}
