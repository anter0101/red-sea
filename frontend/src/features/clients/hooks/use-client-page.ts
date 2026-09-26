'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useGetOneClient } from '../api/get-one';
import { useDeleteClient } from '../api/delete';

const VALID_TABS = new Set(['info', 'trips', 'accounts']);

export const useClientPage = (clientId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { client, isGetClientPending, error } = useGetOneClient(clientId);
  const { deleteClientMutation, isDeleteClientPending } = useDeleteClient();

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
    deleteClientMutation(clientId.toString(), {
      onSuccess: () => {
        router.push('/clients');
      },
    });
  };

  return {
    client,
    isGetClientPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteClientPending,
  };
};
