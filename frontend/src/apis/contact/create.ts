import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';
import type { IContact } from '@/types/contact/index';
import type { IContactRequest } from '@/types/contact/mutation-request';

export const useCreateContact = () => {
  const t = useTranslations('common');

  const { mutate: createContactMutation, isPending: isCreateContactPending } = useCreate<
    IContact[],
    Error,
    IContactRequest[]
  >({
    endPoint: 'api/contacts',
    queryKey: ['contacts'],
    onSuccess: () => {
      toast.success(t('actions.contact-created-successfully'));
    },
  });
  return { createContactMutation, isCreateContactPending };
};
