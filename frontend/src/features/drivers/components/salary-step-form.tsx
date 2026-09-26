'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { useCreateSalary } from '@/apis/salary/create';
import { useUpdateSalary } from '@/apis/salary/update';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { SalaryTypes } from '@/enums/salary-types';
import type { IDriver } from '@/features/drivers/types';
import {
  buildSalaryPayload,
  driverSalaryFormSchema,
  salaryToFormDefaults,
  type DriverSalaryFormValues,
} from '@/features/salary/driver-salary-form.utils';
import type { ICreateSalaryRequest } from '@/types/salary/mutation-request';
import { zodResolver } from '@hookform/resolvers/zod';

interface DriverSalaryFormProps {
  onNext: () => void;
  onPrevious: () => void;
  driver: IDriver | undefined;
}

const DriverSalaryForm = ({ onNext, onPrevious, driver }: DriverSalaryFormProps) => {
  const locale = useLocale();
  const t = useTranslations('drivers');

  const { createSalaryMutation, isCreateSalaryPending } = useCreateSalary();
  const { updateSalaryMutation, isUpdateSalaryPending } = useUpdateSalary();

  const form = useForm<DriverSalaryFormValues>({
    resolver: zodResolver(driverSalaryFormSchema(t)),
    defaultValues: salaryToFormDefaults(null),
    mode: 'onChange',
  });

  const salaryType = form.watch('salaryType');

  useEffect(() => {
    if (driver?.user?.id) {
      form.reset(salaryToFormDefaults(driver.user.salary));
    }
  }, [driver, form]);

  const onSubmit = (data: DriverSalaryFormValues) => {
    if (!driver?.user?.id) return;

    const salaryData = buildSalaryPayload(data, driver.user.id) as ICreateSalaryRequest & {
      id?: number;
    };

    if (data.id) {
      updateSalaryMutation(
        { id: data.id, data: salaryData },
        { onSuccess: () => onNext() },
      );
    } else {
      createSalaryMutation(salaryData, { onSuccess: () => onNext() });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="salaryType"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('fields.salary-type')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('placeholders.select-salary-type')}>
                      {field.value === SalaryTypes.COMMISSION
                        ? t('salary-types.commission')
                        : field.value === SalaryTypes.NOLON_PERCENT
                          ? t('salary-types.nolon-percent')
                          : field.value === SalaryTypes.MONTHLY
                            ? t('salary-types.monthly')
                            : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value={SalaryTypes.MONTHLY} className="items-start h-auto py-2.5">
                    <div className="flex flex-col gap-0.5 pe-2 text-start">
                      <span className="font-medium">{t('salary-types.monthly')}</span>
                      <span className="text-muted-foreground text-xs font-normal whitespace-normal">
                        {t('salary-type-descriptions.monthly')}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value={SalaryTypes.COMMISSION} className="items-start h-auto py-2.5">
                    <div className="flex flex-col gap-0.5 pe-2 text-start">
                      <span className="font-medium">{t('salary-types.commission')}</span>
                      <span className="text-muted-foreground text-xs font-normal whitespace-normal">
                        {t('salary-type-descriptions.commission')}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value={SalaryTypes.NOLON_PERCENT} className="items-start h-auto py-2.5">
                    <div className="flex flex-col gap-0.5 pe-2 text-start">
                      <span className="font-medium">{t('salary-types.nolon-percent')}</span>
                      <span className="text-muted-foreground text-xs font-normal whitespace-normal">
                        {t('salary-type-descriptions.nolon-percent')}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {salaryType ? (
                <FormDescription>
                  {t(
                    `salary-type-descriptions.${
                      salaryType === SalaryTypes.COMMISSION
                        ? 'commission'
                        : salaryType === SalaryTypes.NOLON_PERCENT
                          ? 'nolon-percent'
                          : 'monthly'
                    }`,
                  )}
                </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        {salaryType === SalaryTypes.MONTHLY && (
          <>
            <FormField
              control={form.control}
              name="salaryAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.salary')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t('placeholders.salary-amount')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyWorkPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.daily-work-price')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t('placeholders.daily-work-price')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {salaryType === SalaryTypes.COMMISSION && (
          <FormField
            control={form.control}
            name="dailyWorkPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.daily-work-price')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('placeholders.daily-work-price')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} hidden />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t('buttons.previous')}
          </Button>
          <Button type="submit" disabled={isCreateSalaryPending || isUpdateSalaryPending}>
            {(isCreateSalaryPending || isUpdateSalaryPending) && <Spinner />} {t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DriverSalaryForm;
