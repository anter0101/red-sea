'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useGetOne } from '@/hooks/base/get-one';
import { usePut } from '@/hooks/base/update';
import type { CompanySettings, CompanySettingsFormValues } from '../types';

const schema = z.object({
  name: z.string().trim().min(1),
  taxCard: z.string().trim().min(1),
  commercialRegister: z.string().trim().min(1),
});

export function CompanySettingsForm() {
  const t = useTranslations('companySettings');
  const settings = useGetOne<CompanySettings, Error>({
    endPoint: '/api/company-settings',
    queryKey: ['company-settings'],
  });
  const { mutate, isPending } = usePut<CompanySettings, Error, CompanySettingsFormValues>({
    endPoint: '/api/company-settings',
    queryKey: ['company-settings'],
    onSuccess: () => toast.success(t('saved')),
  });

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', taxCard: '', commercialRegister: '' },
  });

  useEffect(() => {
    if (!settings.data) return;
    form.reset({
      name: settings.data.name ?? '',
      taxCard: settings.data.taxCard ?? '',
      commercialRegister: settings.data.commercialRegister ?? '',
    });
  }, [settings.data, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate({ data }))}
        className="mx-auto max-w-xl space-y-4"
        dir="rtl"
      >
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxCard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('taxCard')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="commercialRegister"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('commercialRegister')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending || settings.isPending}>
            {isPending && <Spinner className="mr-2" />}
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
