'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useGetOneBranch } from '../api/get-one';
import { useDeleteBranch } from '../api/delete';

const VALID_TABS = new Set(['emp', 'trips', 'accounts']);

export const useBranchPage = (branchId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { branch, isGetBranchPending, error } = useGetOneBranch(branchId);
  const { deleteBranchMutation, isDeleteBranchPending } = useDeleteBranch();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab') ?? 'emp';
    return VALID_TABS.has(tab) ? tab : 'emp';
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tabId: string) => {
      router.replace(
        pathname +
          '?' +
          createQueryString(searchParams, {
            tab: tabId === 'emp' ? null : tabId,
          }),
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  const handleDelete = () => {
    deleteBranchMutation(branchId.toString(), {
      onSuccess: () => {
        router.push('/branches');
      },
    });
  };

  return {
    branch,
    isGetBranchPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteBranchPending,
  };
};
