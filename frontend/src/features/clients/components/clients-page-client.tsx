'use client';

import { useRouter } from 'next/navigation';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import Loader from '@/components/common/loader';
import { useGetAllClients } from '@/features/clients/api/get-all';
import ClientsList from '@/features/clients/components/list';

export default function ClientsPageClient() {
  const router = useRouter();
  const { clients, isGetClientsPending } = useGetAllClients();

  return (
    <div className="flex flex-col gap-4">
      <EntitiesToolbar onAdd={() => router.push('/clients/create')} />
      {isGetClientsPending ? <Loader /> : <ClientsList clients={clients} />}
    </div>
  );
}
