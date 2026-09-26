import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useGetOneTrailer } from '../api/get-one';
import { useDeleteTrailer } from '../api/delete';

const VALID_TABS = new Set(['info', 'trips', 'maintenance', 'physical-attachments']);

export const useTrailerPage = (trailerId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trailer, isGetTrailerLoading, error } = useGetOneTrailer(trailerId);
  const { deleteTrailerMutation, isDeleteTrailerPending } = useDeleteTrailer();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab') ?? 'info';
    return VALID_TABS.has(tab) ? tab : 'info';
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tabId: string) => {
      router.replace(
        pathname +
          '?' +
          createQueryString(searchParams, {
            tab: tabId === 'info' ? null : tabId,
          }),
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  const handleDelete = () => {
    deleteTrailerMutation(trailerId.toString(), {
      onSuccess: () => {
        router.push('/trailers');
      },
    });
  };

  return {
    trailer,
    isGetTrailerLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteTrailerPending,
  };
};
