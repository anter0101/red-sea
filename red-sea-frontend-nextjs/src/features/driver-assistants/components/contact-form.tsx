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
import type { IContactRequest } from '@/types/contact/mutation-request';
import type { IUser } from '@/types/user/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

const driverAssistantContactFormSchema = (t: (key: string) => string) =>
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

type DriverAssistantContactFormValues = z.infer<
  ReturnType<typeof driverAssistantContactFormSchema>
>;

interface DriverAssistantContactFormProps {
  onNext: () => void;
  onPrevious: () => void;
  driverAssistant: IUser | undefined;
}

const DriverAssistantContactForm = ({
  onNext,
  onPrevious,
  driverAssistant,
}: DriverAssistantContactFormProps) => {
  const queryClient = useQueryClient();
  const t = useTranslations('driverAssistants');

  const { createContactMutation, isCreateContactPending } = useCreateContact();
  const { updateContactMutation, isUpdateContactPending } = useUpdateContact();

  const form = useForm<DriverAssistantContactFormValues>({
    resolver: zodResolver(driverAssistantContactFormSchema(t)),
    defaultValues: {
      phoneNumber: '',
      emergencyPhoneNumber: '',
    },
  });

  useEffect(() => {
    if (driverAssistant?.contacts) {
      const primaryContact = driverAssistant?.contacts?.find(
        (contact) => contact?.isPrimary === true,
      );

      form.setValue('phoneNumber', primaryContact?.phone ?? '');
      form.setValue('primaryPhoneNumberId', primaryContact?.id ?? null);
      const emergencyContact = driverAssistant?.contacts?.find(
        (contact) => contact?.isPrimary !== true,
      );

      form.setValue('emergencyPhoneNumberId', emergencyContact?.id ?? null);
      form.setValue('emergencyPhoneNumber', emergencyContact?.phone ?? '');
    }
  }, [driverAssistant?.contacts, form]);

  const onSubmit = (data: DriverAssistantContactFormValues) => {
    const contacts: IContactRequest[] = [
      {
        ...(data.primaryPhoneNumberId && { id: data.primaryPhoneNumberId }),
        phone: data.phoneNumber,
        userId: driverAssistant?.id,
        isPrimary: true,
      },
      ...(data.emergencyPhoneNumber
        ? [
            {
              ...(data.emergencyPhoneNumberId && {
                id: data.emergencyPhoneNumberId,
              }),
              phone: data.emergencyPhoneNumber,
              userId: driverAssistant?.id,
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
              queryKey: ['users'],
            });
          },
        },
      );
    } else {
      createContactMutation(contacts, {
        onSuccess: () => {
          onNext();
          queryClient.invalidateQueries({
            queryKey: ['users'],
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

export default DriverAssistantContactForm;
