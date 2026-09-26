import { useTranslations } from 'next-intl';

import { useCreate } from '@/hooks/base/create';
import { ITripFeesPayload } from '../../types/transactions';

export const useCreateTransactionActivity = () => {
  const t = useTranslations('common');

  const {
    mutate: createTransactionActivityMutation,
    isPending: isCreateTransactionActivityPending,
  } = useCreate<ITripFeesPayload, Error, ITripFeesPayload>({
    endPoint: '/api/journey-transactions/bulk',
    queryKey: ['journey-transactions', 'bulk'],
  });

  return {
    createTransactionActivityMutation,
    isCreateTransactionActivityPending,
  };
};
