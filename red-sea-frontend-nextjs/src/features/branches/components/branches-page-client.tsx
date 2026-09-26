'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import Loading from '@/components/common/loader';
import TableFilters from '@/components/common/table-filters';
import { useGetAllBranches } from '@/features/branches/api/get-all';
import BranchesList from '@/features/branches/components/list';
import { usePaginationParams } from '@/hooks/use-pagination-params';

export default function BranchesPageClient() {
  const router = useRouter();
  const t = useTranslations('common');
  const params = usePaginationParams();
  const { branches, isGetBranchesPending } = useGetAllBranches(params);

  return (
    <div className="flex flex-col gap-4">
      <EntitiesToolbar onAdd={() => router.push('/branches/create')} />
      <TableFilters />
      {isGetBranchesPending ? <Loading /> : <BranchesList branches={branches} />}
    </div>
  );
}
