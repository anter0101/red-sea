import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import { useQueryClient } from '@tanstack/react-query';

export interface IOwnerAssignment {
  id: number;
  percentage: number;
  contractUrl?: string;
  notes?: string;
}

export interface IBulkAssignOwnersRequest {
  trailerId: number;
  owners: IOwnerAssignment[];
}

export interface IBulkAssignOwnersResponse {
  success: boolean;
  message?: string;
}

export const useTrailerBulkAssignOwners = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  const { mutate: bulkAssignOwnersMutation, isPending: isBulkAssignOwnersPending } = useCreate<
    IBulkAssignOwnersResponse,
    Error,
    IBulkAssignOwnersRequest
  >({
    endPoint: '/api/owners/bulk-assign',
    queryKey: ['owners', 'trailers'],
    onSuccess: () => {
      // toast.success(t("actions.owners-assigned-successfully"));
      queryClient.invalidateQueries({ queryKey: ['trailers'] });
    },
  });

  return { bulkAssignOwnersMutation, isBulkAssignOwnersPending };
};
