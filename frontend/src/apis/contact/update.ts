import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';
import type { IContact } from '@/types/contact';
import type { IContactRequest } from '@/types/contact/mutation-request';

export const useUpdateContact = () => {
  const t = useTranslations('common');

  const { mutate: updateContactMutation, isPending: isUpdateContactPending } = usePut<
    IContact[],
    Error,
    IContactRequest[]
  >({
    endPoint: `api/contacts`,
    queryKey: ['contacts'],
    onSuccess: () => {
      toast.success(t('actions.contact-updated-successfully'));
    },
  });

  return {
    updateContactMutation,
    isUpdateContactPending,
  };
};
