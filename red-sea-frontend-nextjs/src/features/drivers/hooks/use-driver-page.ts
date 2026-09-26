import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useDeleteDriver } from '../api/delete';
import { useGetDriver } from '../api/get-one';

const VALID_TABS = new Set(['info', 'trips', 'attachments']);

export const useDriverPage = (driverId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { driver, isGetDriverLoading, error } = useGetDriver(driverId);
  const { deleteDriverMutation, isDeleteDriverPending } = useDeleteDriver();

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
    deleteDriverMutation(driverId.toString(), {
      onSuccess: () => {
        router.push('/drivers');
      },
    });
  };

  return {
    driver,
    isGetDriverLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteDriverPending,
  };
};
