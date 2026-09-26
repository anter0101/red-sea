import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useDeleteCar } from '../api/delete';
import { useGetOneCar } from '../api/get-one';

const VALID_TABS = new Set(['info', 'trips', 'maintenance', 'physical-attachments']);

export const useCarPage = (carId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { car, isGetCarLoading, error } = useGetOneCar(carId);
  const { deleteCarMutation, isDeleteCarPending } = useDeleteCar();

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
    deleteCarMutation(carId.toString(), {
      onSuccess: () => {
        router.push('/cars');
      },
    });
  };

  return {
    car,
    isGetCarLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteCarPending,
  };
};
