import { useTranslations } from 'next-intl';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { getApiErrorMessage } from '@/lib/api-error';
import type { IApiResError } from '@/types/api-res-error';
import type { IApiResSuccess } from '@/types/api-res-success';

import { usePut } from '../base/update';

export const resetPasswordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: z
        .string()
        .min(1, t('validation.password-required'))
        .min(8, t('validation.password-min-length-8'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          t('validation.password-complexity'),
        ),
      confirmPassword: z.string().min(1, t('validation.confirm-password-required')),
      token: z.string().min(1, t('validation.token-required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwords-must-match'),
      path: ['confirmPassword'],
    });

export type ResetPasswordInput = z.infer<ReturnType<typeof resetPasswordFormSchema>>;

export const useResetPassword = () => {
  const t = useTranslations('auth');
  const mutation = usePut<
    IApiResSuccess<ResetPasswordInput>,
    AxiosError<IApiResError>,
    ResetPasswordInput
  >({
    endPoint: '/api/auth/reset-password',
    queryKey: ['auth', 'reset-password'],
    onSuccess: () => {
      toast.success(t('password-reset-successful'));
    },
    onError: (error) => {
      const backendMessage = getApiErrorMessage(error, '');
      if (backendMessage) {
        toast.error(backendMessage);
        return;
      }
      if (error.response?.status === 401) {
        toast.error(t('invalid-token'));
      } else {
        toast.error(t('password-reset-failed'));
      }
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
};
