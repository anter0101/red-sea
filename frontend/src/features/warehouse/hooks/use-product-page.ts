import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { createQueryString } from '@/lib/utils';
import { useDeleteProduct } from '../api/delete';
import { useGetOneProduct } from '../api/get-one';

const VALID_TABS = new Set(['info', 'stock']);

export const useProductPage = (productId: number) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ProductInfo, isGetProductLoading, error } = useGetOneProduct(productId);
  const { deleteProductMutation, isDeleteProductPending } = useDeleteProduct();

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
    deleteProductMutation(productId.toString(), {
      onSuccess: () => {
        router.push('/warehouse');
      },
    });
  };

  return {
    product: ProductInfo,
    isGetProductLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteProductPending,
  };
};
