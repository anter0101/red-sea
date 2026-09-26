'use client';

import { useParams } from 'next/navigation';

import { ClientForm } from '@/features/clients/components/client-form';
import { useGetOneClient } from '@/features/clients/api/get-one';

export default function UpdateClientPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const { client, isGetClientPending } = useGetOneClient(Number(clientId));

  if (isGetClientPending) {
    return <div className="p-4 container mx-auto max-w-4xl">Loading...</div>;
  }

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <ClientForm client={client} />
    </div>
  );
}
