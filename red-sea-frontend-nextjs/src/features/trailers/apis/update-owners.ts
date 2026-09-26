import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import { useQueryClient } from '@tanstack/react-query';

export interface IOwnerAssignment {
  id: number;
  percentage: number;
  contractUrl?: string;
  notes?: string;
}

export interface IUpdateOwnersData {
  trailerId: number;
  owners: IOwnerAssignment[];
}

export interface IUpdateOwnersResponse {
  success: boolean;
  message?: string;
}

export const useUpdateTrailerOwners = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  const mutation = usePut<IUpdateOwnersResponse, Error, IUpdateOwnersData>({
    endPoint: '/api/owners/bulk-assign',
    queryKey: ['owners', 'trailers'],
    onSuccess: () => {
      toast.success(t('actions.owners-assigned-successfully'));
      queryClient.invalidateQueries({ queryKey: ['trailers'] });
    },
  });

  return {
    updateOwnersMutation: mutation.mutate,
    isUpdateOwnersPending: mutation.isPending,
  };
};
