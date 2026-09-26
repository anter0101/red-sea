import type { IPartner } from '@/features/partners/types/partner';
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

export interface IPartnerTableRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  bankAccountNumber: string;
  bankName: string;
  address: string;
  addedBy: string;
  joinDate: string;
  createdBy: string;
  createdAt: string;
}

interface PartnersQueryParams extends IQueryParams {
  search?: string;
}

export function mapPartnerRow(partner: IPartner): IPartnerTableRow {
  return {
    id: partner.id as number,
    name: partner.name ?? '-',
    email: partner.email ?? '-',
    phone: partner.phone ?? '-',
    bankAccountNumber: partner.bankAccountNumber ?? '-',
    bankName: partner.bankName ?? '-',
    address: partner.address ?? '-',
    addedBy: partner.createdBy ?? '-',
    joinDate: partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '-',
    createdBy: partner.createdBy ?? '-',
    createdAt: partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : '-',
  };
}

export const useGetAllPartners = (params?: PartnersQueryParams) => {
  const {
    data,
    isPending: isGetPartnersPending,
    error: getPartnersError,
  } = useGetPaginated<IPartner, PartnersQueryParams>({
    endPoint: '/api/owners',
    queryKey: ['owners'],
    params: {
      ...params,
      search: params?.search ?? '',
    },
  });

  const partners: IPartnerTableRow[] = data?.data?.map(mapPartnerRow) ?? [];
  const totalPartnersCount = data?.totalCount ?? 0;

  return {
    partners,
    getPartnersError,
    isGetPartnersPending,
    totalPartnersCount,
  };
};
