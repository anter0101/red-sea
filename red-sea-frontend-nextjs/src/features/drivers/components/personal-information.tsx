'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { useCreateDriver } from '@/features/drivers/api/create';
import { useEditDrivers } from '@/features/drivers/api/update';
import { type IDriver } from '@/features/drivers/types';
import { type CreateDriverFormValues } from '@/features/drivers/types/create';
import { createDriverSchema } from '@/features/drivers/types/create';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

interface DriverPersonalInformationProps {
  onNext: () => void;
  onPrevious: () => void;
  setDriverId: (driverId: number | null) => void;
  driver: IDriver | undefined;
  isGetDriverLoading: boolean;
}

const DriverPersonalInformation = ({
  onNext,
  onPrevious,
  setDriverId,
  driver,
  isGetDriverLoading,
}: DriverPersonalInformationProps) => {
  const t = useTranslations('drivers');
  const { createDriverMutation, isCreateDriverPending } = useCreateDriver();
  const { editDriversMutation, isEditDriversLoading } = useEditDrivers();
  const form = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema(t)),
    defaultValues: {
      notes: '',
      firstName: '',
      lastName: '',
      activated: true,
      role: UserRoles.DRIVER,
      personalId: '',
      personalIdExpiryDate: undefined,
      licenseNumber: '',
      licenseExpiryDate: undefined,
      joinDate: new Date(),
      phoneNumber: '',
      emergencyPhoneNumber: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (driver) {
      const primaryContact = driver.user?.contacts?.find((contact) => contact?.isPrimary === true);
      const emergencyContact = driver.user?.contacts?.find(
        (contact) => contact?.isPrimary !== true,
      );

      form.reset({
        id: driver.id ?? undefined,
        notes: driver.user?.notes ?? '',
        firstName: driver.user?.firstName ?? '',
        lastName: driver.user?.lastName ?? '',
        personalId: driver.user?.personalId ?? '',
        personalIdExpiryDate: driver.user?.personalIdExpiryDate
          ? new Date(driver.user.personalIdExpiryDate)
          : undefined,
        licenseNumber: driver.licenseNumber ?? '',
        licenseExpiryDate: driver.licenseExpiryDate
          ? new Date(driver.licenseExpiryDate)
          : undefined,
        activated: driver.user?.status === UserStatus.AVAILABLE ? true : false,
        role: driver.user?.role ?? UserRoles.DRIVER,
        joinDate: driver.createdAt ? new Date(driver.createdAt) : undefined,
        phoneNumber: primaryContact?.phone ?? '',
        emergencyPhoneNumber: emergencyContact?.phone ?? '',
      });
    }
  }, [driver, form]);

  const onSubmit = (data: CreateDriverFormValues) => {
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

    const driverObject: IDriver = {
      ...(driver?.id && { id: driver?.id }),
      licenseNumber: data.licenseNumber,
      licenseExpiryDate: data.licenseExpiryDate,
      user: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRoles.DRIVER,
        personalId: data.personalId,
        personalIdExpiryDate: data.personalIdExpiryDate,
        notes: data.notes,
        status: data.activated === true ? UserStatus.AVAILABLE : UserStatus.UNAVAILABLE,
        createdAt: data.joinDate,
        contacts,
        // email:"test@test.com"
      },
    };

    if (driver?.id) {
      editDriversMutation(
        { id: driver?.id, data: driverObject },
        {
          onSuccess: (res) => {
            setDriverId(res?.id ?? null);
            onNext();
          },
        },
      );
    } else {
      createDriverMutation(driverObject, {
        onSuccess: (res) => {
          setDriverId(res?.id ?? null);
          onNext();
        },
      });
    }
  };

  if (isGetDriverLoading) {
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
                <Input hidden {...field} value={driver?.id?.toString() ?? ''} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Number */}
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.driving-license-number')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.driving-license-number')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* License Expiry Date */}
          <FormField
            control={form.control}
            name="licenseExpiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.driving-license-expiry-date')}</FormLabel>
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
        {/* License Expiry Date */}
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
          <Button type="submit" disabled={isCreateDriverPending || isEditDriversLoading}>
            {(isCreateDriverPending || isEditDriversLoading) && <Spinner />} {t('buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DriverPersonalInformation;
