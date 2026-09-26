import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import type { IUser } from '@/types/user/index';

export const useUpdateUser = () => {
  const t = useTranslations('common');

  const { mutate: updateUserMutation, isPending: isUpdateUserLoading } = usePut<
    IUser,
    Error,
    IUser
  >({
    endPoint: `api/users`,
    queryKey: ['users'],
    onSuccess: () => {
      toast.success(t('actions.user-updated-successfully'));
    },
  });

  return {
    updateUserMutation,
    isUpdateUserLoading,
  };
};
