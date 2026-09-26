'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { useCreateUser } from '@/apis/users/create';
import { useUpdateUser } from '@/apis/users/udapte';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UserRoles } from '@/enums/users/user-roles';
import { UserStatus } from '@/enums/users/user-status';
import { cn } from '@/lib/utils';
import type { IUser } from '@/types/user/index';
import { zodResolver } from '@hookform/resolvers/zod';

interface DriverPersonalInformationProps {
  onNext: () => void;
  onPrevious: () => void;
  setDriverAssistantId: (driverAssistantId: number | null) => void;
  driverAssistant: IUser | undefined;
  isGetUserLoading: boolean;
}

export const createDriverAssistantSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number().optional(),
    firstName: z.string().min(1, t('validation.first-name-required')),
    lastName: z.string().min(1, t('validation.last-name-required')),
    activated: z.boolean(),
    role: z.enum(UserRoles),
    personalId: z
      .string()
      .min(14, t('validation.personal-id-must-be-14-digits'))
      .max(14, t('validation.personal-id-must-be-14-digits')),
    personalIdExpiryDate: z.date({
      message: t('validation.personal-id-expiry-date-required'),
    }),
    notes: z.string(),
    joinDate: z.date(),
    phoneNumber: z
      .string()
      .min(11, t('validation.phone-number-must-be-11-digits'))
      .max(11, t('validation.phone-number-must-be-11-digits')),
    emergencyPhoneNumber: z
      .string()
      .max(11, t('validation.phone-number-must-be-11-digits'))
      .optional()
      .or(z.literal('')),
  });

export type CreateDriverAssistantFormValues = z.infer<
  ReturnType<typeof createDriverAssistantSchema>
>;

const DriverPersonalInformation = ({
  onNext,
  onPrevious,
  setDriverAssistantId,
  driverAssistant,
  isGetUserLoading,
}: DriverPersonalInformationProps) => {
  const t = useTranslations('driverAssistants');
  const { createUserMutation, isCreateUserPending } = useCreateUser();
  const { updateUserMutation, isUpdateUserLoading } = useUpdateUser();

  const form = useForm<CreateDriverAssistantFormValues>({
    resolver: zodResolver(createDriverAssistantSchema(t)),
    defaultValues: {
      notes: '',
      firstName: '',
      lastName: '',
      activated: true,
      role: UserRoles.DRIVER_ASSISTANT,
      personalId: '',
      personalIdExpiryDate: undefined,
      joinDate: new Date(),
      phoneNumber: '',
      emergencyPhoneNumber: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (driverAssistant) {
      const primaryContact = driverAssistant.contacts?.find(
        (contact) => contact?.isPrimary === true,
      );
      const emergencyContact = driverAssistant.contacts?.find(
        (contact) => contact?.isPrimary !== true,
      );

      form.reset({
        id: driverAssistant.id ?? undefined,
        notes: driverAssistant.notes ?? '',
        firstName: driverAssistant.firstName ?? '',
        lastName: driverAssistant.lastName ?? '',
        activated: driverAssistant.status === UserStatus.AVAILABLE ? true : false,
        role: driverAssistant.role ?? UserRoles.DRIVER,
        joinDate: driverAssistant.createdAt ? new Date(driverAssistant.createdAt) : undefined,
        personalId: driverAssistant.personalId ?? '',
        personalIdExpiryDate: driverAssistant.personalIdExpiryDate
          ? new Date(driverAssistant.personalIdExpiryDate)
          : undefined,
        phoneNumber: primaryContact?.phone ?? '',
        emergencyPhoneNumber: emergencyContact?.phone ?? '',
      });
    }
  }, [driverAssistant, form]);

  const onSubmit = (data: CreateDriverAssistantFormValues) => {
    const contacts = [
      {
        phone: data.phoneNumber,
        isPrimary: true,
      },
      ...(data.emergencyPhoneNumber
        ? [
            {
              phone: data.emergencyPhoneNumber,
              isPrimary: false,
            },
          ]
        : []),
    ];

    const driverAssistantObject: IUser = {
      ...(driverAssistant?.id && { id: driverAssistant?.id }),

      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRoles.DRIVER_ASSISTANT,
      personalId: data.personalId,
      personalIdExpiryDate: data.personalIdExpiryDate,
      notes: data.notes,
      status: data.activated === true ? UserStatus.AVAILABLE : UserStatus.UNAVAILABLE,
      createdAt: data.joinDate,
      contacts,
    };

    if (driverAssistant?.id) {
      updateUserMutation(
        { id: driverAssistant?.id, data: driverAssistantObject },
        {
          onSuccess: (res) => {
            setDriverAssistantId(res?.id ?? null);
            onNext();
          },
        },
      );
    } else {
      createUserMutation(driverAssistantObject, {
        onSuccess: (res) => {
          setDriverAssistantId(res?.id ?? null);
          onNext();
        },
      });
    }
  };

  if (isGetUserLoading) {
    return <Spinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {' '}
        {/* First Name */}
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input hidden {...field} value={driverAssistant?.id?.toString() ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.first-name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.first-name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.last-name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.last-name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal ID */}
          <FormField
            control={form.control}
            name="personalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.personal-id')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.personal-id')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personal ID Expiry Date */}
          <FormField
            control={form.control}
            name="personalIdExpiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.personal-id-expiry-date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>{t('placeholders.pick-date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Join Date */}
        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('fields.join-date')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>{t('placeholders.pick-date')}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.phone-number')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.phone-number')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emergency Phone Number */}
          <FormField
            control={form.control}
            name="emergencyPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.emergency-phone-number')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('placeholders.phone-number')}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.notes')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('placeholders.notes')}
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Activated Switch */}
        <FormField
          control={form.control}
          name="activated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('fields.activate-driver')}</FormLabel>
                <FormDescription>{t('fields.activate-driver-description')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isCreateUserPending || isUpdateUserLoading}>
            {(isCreateUserPending || isUpdateUserLoading) && <Spinner />} {t('buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DriverPersonalInformation;
