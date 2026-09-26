'use client';

import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useGetUnprintedJourneys } from '@/features/delegation-print/api/get-unprinted';

import { resolveSafeOfficeReturnTo } from '@/features/office/utils/office-journey-draft';

import { useCreateOfficeRequest } from '../api/create';
import { OFFICE_REQUEST_TYPES, type OfficeRequestType } from '../enums/office-request-type';
import {
  officeRequestFormSchema,
  toOfficeRequestBody,
  type OfficeRequestFormValues,
} from '../types';

const EMPTY: OfficeRequestFormValues = {
  type: 'PRINT_DELEGATION',
  description: '',
  journeyId: '',
  amount: '',
};

function resolveInitialType(param: string | null): OfficeRequestFormValues['type'] {
  if (param && (OFFICE_REQUEST_TYPES as readonly string[]).includes(param)) {
    return param as OfficeRequestType;
  }
  return 'PRINT_DELEGATION';
}

export default function OfficeRequestForm() {
  const t = useTranslations('officeRequests');
  const router = useRouter();
  const searchParams = useSearchParams();

  const { createOfficeRequestMutation, isCreateOfficeRequestPending } = useCreateOfficeRequest();
  const { unprintedJourneys, isUnprintedJourneysPending } = useGetUnprintedJourneys();

  const form = useForm<OfficeRequestFormValues>({
    resolver: zodResolver(officeRequestFormSchema),
    defaultValues: {
      ...EMPTY,
      type: resolveInitialType(searchParams.get('type')),
    },
  });

  useEffect(() => {
    const type = resolveInitialType(searchParams.get('type'));
    if (type !== form.getValues('type')) {
      form.setValue('type', type);
    }
  }, [searchParams, form]);

  const selectedType = form.watch('type');
  const isPrintDelegation = selectedType === 'PRINT_DELEGATION';
  const isAskForCustody = selectedType === 'ASK_FOR_CUSTODY';

  const onSubmit = (values: OfficeRequestFormValues) => {
    const returnTo = resolveSafeOfficeReturnTo(searchParams.get('returnTo'));
    createOfficeRequestMutation(toOfficeRequestBody(values), {
      onSuccess: () => router.push(returnTo ?? '/office-requests'),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.type')} *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  form.setValue('journeyId', '');
                  form.setValue('amount', '');
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('form.selectPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OFFICE_REQUEST_TYPES.map((ty) => (
                    <SelectItem key={ty} value={ty}>
                      {t(`types.${ty}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPrintDelegation && (
          <>
            <FormField
              control={form.control}
              name="journeyId"
              render={({ field }) => {
                let journeyContent: React.ReactNode;
                if (isUnprintedJourneysPending) {
                  journeyContent = (
                    <div className="px-3 py-2 text-sm text-muted-foreground">...</div>
                  );
                } else if (unprintedJourneys.length === 0) {
                  journeyContent = (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {t('form.noJourneys')}
                    </div>
                  );
                } else {
                  journeyContent = unprintedJourneys.map((journey) => (
                    <SelectItem key={journey.journeyId} value={String(journey.journeyId)}>
                      {journey.delegateNumber ?? String(journey.journeyId)}
                    </SelectItem>
                  ));
                }
                return (
                  <FormItem>
                    <FormLabel>{t('form.journey')} *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('form.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>{journeyContent}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </>
        )}

        {isAskForCustody && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.amount')} *</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
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
            disabled={isCreateOfficeRequestPending}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isCreateOfficeRequestPending}>
            {isCreateOfficeRequestPending && <Spinner className="mr-2" />}
            {t('form.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
