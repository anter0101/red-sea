import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useGetUser } from '@/apis/users/get-one';
import { useDeleteUser } from '@/apis/users/delete';
import { createQueryString } from '@/lib/utils';

const VALID_TABS = new Set(['info', 'trips']);

export const useDriverAssistantPage = (assistantId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    user: assistant,
    isGetUserLoading: isGetAssistantLoading,
    error,
  } = useGetUser(assistantId);

  const { deleteUserMutation } = useDeleteUser();

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
    deleteUserMutation(assistantId.toString(), {
      onSuccess: () => {
        router.push('/driver-assistants');
      },
    });
  };

  return {
    assistant,
    isGetAssistantLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
  };
};
