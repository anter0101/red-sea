import { useState } from 'react';
import { useParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';

import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { getApiErrorMessage } from '@/lib/api-error';
import { DEFAULT_LOCALE, homeForRole } from '@/lib/auth-paths';
export const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t('validation.email-invalid')).min(1, t('validation.email-required')),
    password: z
      .string()
      .nonempty(t('validation.password-required'))
      .min(5, t('validation.password-min-length-8')),
  });

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export interface LoginResult {
  ok: boolean;
  error?: string | null;
}

export const useLogin = () => {
  const params = useParams();
  const t = useTranslations('auth');
  const [isPending, setIsPending] = useState(false);

  const mutate = async (loginData: LoginInput): Promise<LoginResult> => {
    setIsPending(true);
    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });
      // Check for successful authentication
      if (result?.ok && !result?.error) {
        toast.success(t('login-successful'));
        const session = await getSession();
        const localeParam = params?.locale;
        const locale =
          (Array.isArray(localeParam) ? localeParam[0] : localeParam) || DEFAULT_LOCALE;
        // Full navigation so the new session cookie is sent. A client-side
        // push is bounced back to login when middleware still sees no session.
        window.location.assign(`/${locale}/${homeForRole(session?.user?.role)}`);
        return { ok: true };
      } else {
        // Handle authentication failure
        const errorMessage = t('login-failed');
        toast.error(errorMessage);
        return { ok: false, error: errorMessage };
      }
    } catch (error) {
      const errMessage = getApiErrorMessage(error, t('login-failed'));
      toast.error(errMessage);
      return { ok: false, error: errMessage };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};
