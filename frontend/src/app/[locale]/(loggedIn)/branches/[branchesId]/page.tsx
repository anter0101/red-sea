import BranchPageClient from '@/features/branches/components/branch-page-client';

export default async function BranchPage({ params }: { params: Promise<{ branchesId: string }> }) {
  const { branchesId } = await params;
  return <BranchPageClient branchId={branchesId} />;
}
