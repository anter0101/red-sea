import { useTranslations } from 'next-intl';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import z from 'zod';

import { getApiErrorMessage } from '@/lib/api-error';
import type { IApiResError } from '@/types/api-res-error';
import type { IApiResSuccess } from '@/types/api-res-success';

import { useCreate } from '../base/create';

export const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t('validation.email-invalid')).nonempty(t('validation.email-required')),
  });

export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export const useForgetPassword = () => {
  const t = useTranslations('auth');
  const { mutate, isPending } = useCreate<
    IApiResSuccess<ForgotPasswordInput>,
    AxiosError<IApiResError>,
    ForgotPasswordInput
  >({
    endPoint: '/api/auth/forget-password',
    queryKey: ['/api/auth/forget-password'],
    onSuccess: () => {
      toast.success(t('password-reset-email-sent'));
    },
    onError: (error) => {
      const backendMessage = getApiErrorMessage(error, '');
      if (backendMessage) {
        toast.error(backendMessage);
        return;
      }
      if (error.response?.status === 404) {
        toast.error(t('user-not-found'));
      } else {
        toast.error(t('failed-to-send-reset-email'));
      }
    },
  });

  return { mutate, isPending };
};
