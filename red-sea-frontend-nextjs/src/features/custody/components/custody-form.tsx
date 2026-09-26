'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { useGetAllAccounts } from '@/features/accounting/accounts/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllEmployees } from '@/features/employees/api/get-all';
import { useGetAllJourneys } from '@/features/trips/api/get-all/get-all-journeys';

import { useCreateCustody } from '../api/create';
import { useGetOneCustody } from '../api/get-one';
import { useUpdateCustody } from '../api/update';
import { CUSTODY_STATUSES } from '../enums/custody-status';
import { custodyFormSchema, toCustodyBody, type CustodyFormValues } from '../types';

const EMPTY: CustodyFormValues = {
  employeeId: '',
  accountId: '',
  status: 'ACTIVE',
  journeyId: '',
  driverId: '',
};

interface CustodyFormProps {
  id?: number;
}

export default function CustodyForm({ id }: CustodyFormProps) {
  const t = useTranslations('custody');
  const router = useRouter();
  const isEditing = !!id;

  const { custody, isGetCustodyLoading } = useGetOneCustody(id ?? null);
  const { createCustodyMutation, isCreateCustodyPending } = useCreateCustody();
  const { updateCustodyMutation, isUpdateCustodyPending } = useUpdateCustody();

  const { employees } = useGetAllEmployees();
  const { accounts } = useGetAllAccounts();
  const { journeys } = useGetAllJourneys();
  const { drivers } = useGetAllDrivers();

  const isPending = isCreateCustodyPending || isUpdateCustodyPending;

  const form = useForm<CustodyFormValues>({
    resolver: zodResolver(custodyFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (isEditing && custody) {
      form.reset({
        employeeId: String(custody.employeeId),
        accountId: String(custody.accountId),
        status: custody.status,
        journeyId: custody.journeyId ? String(custody.journeyId) : '',
        driverId: custody.driverId ? String(custody.driverId) : '',
      });
    }
  }, [isEditing, custody, form]);

  const onSubmit = (values: CustodyFormValues) => {
    const body = toCustodyBody(values);
    if (isEditing && id) {
      updateCustodyMutation({ id, data: body }, { onSuccess: () => router.push(`/custody/${id}`) });
    } else {
      createCustodyMutation(body, { onSuccess: () => router.push('/custody') });
    }
  };

  if (isEditing && isGetCustodyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.employee')} *</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...field}
                >
                  <option value="">{t('form.selectPlaceholder')}</option>
                  {employees.map((e) => (
                    <option key={e.id} value={String(e.id)}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.account')} *</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...field}
                >
                  <option value="">{t('form.selectPlaceholder')}</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status')} *</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...field}
                >
                  {CUSTODY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`statuses.${s}`)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="journeyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.journey')}</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...field}
                >
                  <option value="">{t('form.selectPlaceholder')}</option>
                  {journeys.map((j: any) => (
                    <option key={j.id} value={String(j.id)}>
                      {j.delegateNumber ?? String(j.id)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.driver')}</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  {...field}
                >
                  <option value="">{t('form.selectPlaceholder')}</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.driverName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2" />}
            {t('form.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
