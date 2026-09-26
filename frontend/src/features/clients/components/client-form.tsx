'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PricingSheetKind } from '@/features/clients/enums/pricing-sheet-kind';
import { useCreateClient } from '@/features/clients/api/create';
import { useEditClient } from '@/features/clients/api/update';
import type { IClient } from '@/features/clients/types';
import type { ClientFormValues } from '@/features/clients/types/create-schema';
import { ClientSchema } from '@/features/clients/types/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';

interface ClientFormProps {
  client?: IClient; // Edit mode if provided
}

export const ClientForm = ({ client }: ClientFormProps) => {
  const t = useTranslations('clients');
  const router = useRouter();

  const { createClientMutate, isCreateClientPending } = useCreateClient();
  const { editClientMutation, isEditClientLoading } = useEditClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(ClientSchema(t)),
    defaultValues: {
      name: '',
      commercialRecord: '',
      taxInvoice: '',
      taxCard: '',
      electronicRegistration: '',
      destinationsFile: '',
      pricingSheetKind: PricingSheetKind.ARISH,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name ?? '',
        commercialRecord: client.commercialRecord ?? '',
        taxInvoice: client.taxInvoice ?? '',
        taxCard: client.taxCard ?? '',
        electronicRegistration: client.electronicRegistration ?? '',
        destinationsFile: client.destinationsFile ?? '',
        pricingSheetKind: client.pricingSheetKind ?? PricingSheetKind.ARISH,
      });
    }
  }, [client, form]);

  const onSubmit = (data: ClientFormValues) => {
    if (client?.id) {
      // Edit mode
      editClientMutation(
        { id: client.id, data },
        {
          onSuccess: () => router.push('/clients'),
        },
      );
    } else {
      // Create mode
      createClientMutate(data, {
        onSuccess: () => router.push('/clients'),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* اسم العميل */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* السجل التجاري */}
        <FormField
          control={form.control}
          name="commercialRecord"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.commercial-record')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.commercial-record')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* البطاقة الضريبية */}
        <FormField
          control={form.control}
          name="taxCard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.tax-card')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.tax-card')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* أسلوب الشيت */}
        <FormField
          control={form.control}
          name="pricingSheetKind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.pricing-sheet-kind')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('placeholders.pricing-sheet-kind')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PricingSheetKind.ARISH}>
                    {t('pricing-sheet-kind.ARISH')}
                  </SelectItem>
                  <SelectItem value={PricingSheetKind.WATANIA}>
                    {t('pricing-sheet-kind.WATANIA')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ملف الوجهات */}
        <FormField
          control={form.control}
          name="destinationsFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.destinations-file')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.destinations-file')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isCreateClientPending || isEditClientLoading}>
            {(isCreateClientPending || isEditClientLoading) && <Spinner className="mr-2" />}
            {t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
