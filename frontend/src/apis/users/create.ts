import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { IUser } from '@/types/user/index';

export const useCreateUser = () => {
  const t = useTranslations('common');
  const { mutate: createUserMutation, isPending: isCreateUserPending } = useCreate<
    IUser,
    Error,
    IUser
  >({
    endPoint: 'api/users',
    queryKey: ['users'],
    onSuccess: () => {
      toast.success(t('actions.user-created-successfully'));
    },
  });
  return { createUserMutation, isCreateUserPending };
};
