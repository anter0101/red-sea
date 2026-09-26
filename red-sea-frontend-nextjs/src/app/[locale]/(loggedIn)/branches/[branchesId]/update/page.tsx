'use client';

import { useParams } from 'next/navigation';

import Loader from '@/components/common/loader';
import { BranchForm } from '@/features/branches/components/branch-form';
import { useGetOneBranch } from '@/features/branches/api/get-one';

export default function BranchUpdatePage() {
  const params = useParams();
  const branchesId = params.branchesId as string;
  const { branch, isGetBranchPending } = useGetOneBranch(Number(branchesId));

  if (isGetBranchPending) {
    return <Loader />;
  }

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <BranchForm branch={branch} />
    </div>
  );
}
