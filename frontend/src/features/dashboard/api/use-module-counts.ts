'use client';

import { useGetPaginated } from '@/hooks/base/get-paginated';
import { mapWarehouseRow } from '@/features/warehouse/api/get-all';

/** Lightweight totalCount fetches for dashboard module cards. */
export function useDashboardModuleCounts() {
  const partners = useGetPaginated({
    endPoint: '/api/owners',
    queryKey: ['dashboard', 'partners-count'],
    params: { page: 1, pageSize: 1 },
  });
  const clients = useGetPaginated({
    endPoint: '/api/clients',
    queryKey: ['dashboard', 'clients-count'],
    params: { page: 1, pageSize: 1 },
  });
  const branches = useGetPaginated({
    endPoint: '/api/branches',
    queryKey: ['dashboard', 'branches-count'],
    params: { page: 1, pageSize: 1 },
  });
  const suppliers = useGetPaginated({
    endPoint: '/api/suppliers',
    queryKey: ['dashboard', 'suppliers-count'],
    params: { page: 1, pageSize: 1 },
  });
  const gps = useGetPaginated({
    endPoint: '/api/gps-devices',
    queryKey: ['dashboard', 'gps-count'],
    params: { page: 1, pageSize: 1 },
  });
  const custodyActive = useGetPaginated({
    endPoint: '/api/custodies',
    queryKey: ['dashboard', 'custody-active'],
    params: { page: 1, pageSize: 1, status: 'ACTIVE' },
  });
  const officePending = useGetPaginated({
    endPoint: '/api/office-requests',
    queryKey: ['dashboard', 'office-pending'],
    params: { page: 1, pageSize: 1, status: 'PENDING' },
  });
  const warehouse = useGetPaginated({
    endPoint: '/api/warehouses',
    queryKey: ['dashboard', 'warehouse'],
    params: { page: 1, pageSize: 100 },
  });

  const products = (warehouse.data?.data ?? []).map(mapWarehouseRow);
  const lowStockCount = products.filter((p) => p.quantity <= p.alertQuantity).length;

  return {
    partnersCount: partners.data?.totalCount ?? 0,
    clientsCount: clients.data?.totalCount ?? 0,
    branchesCount: branches.data?.totalCount ?? 0,
    suppliersCount: suppliers.data?.totalCount ?? 0,
    gpsCount: gps.data?.totalCount ?? 0,
    custodyActiveCount: custodyActive.data?.totalCount ?? 0,
    officePendingCount: officePending.data?.totalCount ?? 0,
    warehouseTotal: warehouse.data?.totalCount ?? 0,
    lowStockCount,
    isLoading:
      partners.isPending ||
      clients.isPending ||
      branches.isPending ||
      suppliers.isPending ||
      gps.isPending ||
      custodyActive.isPending ||
      officePending.isPending ||
      warehouse.isPending,
  };
}
