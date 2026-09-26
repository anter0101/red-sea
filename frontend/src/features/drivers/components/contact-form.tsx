import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateContact } from '@/apis/contact/create';
import { useUpdateContact } from '@/apis/contact/update';
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
import type { IDriver } from '@/features/drivers/types';
import type { IContactRequest } from '@/types/contact/mutation-request';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

const driverContactFormSchema = (t: (key: string) => string) =>
  z.object({
    phoneNumber: z
      .string()
      .min(11, t('validation.phone-number-must-be-11-digits'))
      .max(11, t('validation.phone-number-must-be-11-digits')),
    emergencyPhoneNumber: z
      .string()
      .max(11, t('validation.phone-number-must-be-11-digits'))
      .optional()
      .nullable(),
    primaryPhoneNumberId: z.number().optional().nullable(),
    emergencyPhoneNumberId: z.number().optional().nullable(),
  });

type DriverContactFormValues = z.infer<ReturnType<typeof driverContactFormSchema>>;

interface DriverContactFormProps {
  onNext: () => void;
  onPrevious: () => void;
  driver: IDriver | undefined;
}

const DriverContactForm = ({ onNext, onPrevious, driver }: DriverContactFormProps) => {
  const queryClient = useQueryClient();
  const t = useTranslations('drivers');
  const { createContactMutation, isCreateContactPending } = useCreateContact();
  const { updateContactMutation, isUpdateContactPending } = useUpdateContact();
  const form = useForm<DriverContactFormValues>({
    resolver: zodResolver(driverContactFormSchema(t)),
    defaultValues: {
      phoneNumber: '',
      emergencyPhoneNumber: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (driver?.user?.contacts) {
      const primaryContact = driver?.user?.contacts?.find((contact) => contact?.isPrimary === true);

      form.setValue('phoneNumber', primaryContact?.phone ?? '');
      form.setValue('primaryPhoneNumberId', primaryContact?.id ?? null);
      const emergencyContact = driver?.user?.contacts?.find(
        (contact) => contact?.isPrimary !== true,
      );

      form.setValue('emergencyPhoneNumberId', emergencyContact?.id ?? null);
      form.setValue('emergencyPhoneNumber', emergencyContact?.phone ?? '');
    }
  }, [driver?.user?.contacts, form]);

  const onSubmit = (data: DriverContactFormValues) => {
    const contacts: IContactRequest[] = [
      {
        ...(data.primaryPhoneNumberId && { id: data.primaryPhoneNumberId }),
        phone: data.phoneNumber,
        userId: driver?.user?.id,
        isPrimary: true,
      },
      ...(data.emergencyPhoneNumber
        ? [
            {
              ...(data.emergencyPhoneNumberId && {
                id: data.emergencyPhoneNumberId,
              }),
              phone: data.emergencyPhoneNumber,
              userId: driver?.user?.id,
              isPrimary: false,
            },
          ]
        : []),
    ];

    if (data.primaryPhoneNumberId) {
      updateContactMutation(
        { data: contacts },
        {
          onSuccess: () => {
            onNext();
            queryClient.invalidateQueries({
              queryKey: ['drivers'],
            });
          },
        },
      );
    } else {
      createContactMutation(contacts, {
        onSuccess: () => {
          onNext();
          queryClient.invalidateQueries({
            queryKey: ['drivers'],
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.phone-number')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.phone-number')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryPhoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.phone-number')}
                  value={field.value ?? ''}
                  hidden
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.emergency-phone-number')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.phone-number')}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyPhoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.phone-number')}
                  value={field.value ?? ''}
                  hidden
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t('buttons.previous')}
          </Button>
          <Button type="submit" disabled={isCreateContactPending || isUpdateContactPending}>
            {(isCreateContactPending || isUpdateContactPending) && <Spinner />} {t('buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DriverContactForm;
