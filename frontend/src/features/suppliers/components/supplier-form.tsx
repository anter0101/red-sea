'use client';

import { useEffect, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useGetAllGovernments } from '@/apis/governments/get-all-governments';
import { useCreateSupplier } from '@/features/suppliers/api/create';
import { useEditSupplier } from '@/features/suppliers/api/update';
import type { ISupplier } from '@/features/suppliers/types';
import type { SupplierFormValues } from '@/features/suppliers/types/create-schema';
import { SupplierSchema } from '@/features/suppliers/types/create-schema';
import { SupplierType, supplierTypeValues } from '@/features/suppliers/enums/supplier-type';
import { zodResolver } from '@hookform/resolvers/zod';

interface SupplierFormProps {
  supplier?: ISupplier;
}

export const SupplierForm = ({ supplier }: SupplierFormProps) => {
  const t = useTranslations('suppliers');
  const router = useRouter();

  const { governments } = useGetAllGovernments();
  const { editSupplierMutation, isEditSupplierPending } = useEditSupplier();
  const { createSupplierMutate, isCreateSupplierPending } = useCreateSupplier();

  const defaultValues = useMemo(() => {
    return {
      name: supplier?.name ?? '',
      type: supplier?.type ?? SupplierType.GOODS,
      governmentId: supplier?.government?.id ? String(supplier.government.id) : '',
      phone: supplier?.phone ?? '',
      commercialRegister: supplier?.commercialRegister ?? '',
      taxCard: supplier?.taxCard ?? '',
      taxRegistrationNumber: supplier?.taxRegistrationNumber ?? '',
    };
  }, [supplier]);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierSchema(t)),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (supplier) {
      form.reset(defaultValues);
    }
  }, [supplier, form, defaultValues]);

  const onSubmit = (data: SupplierFormValues) => {
    const payload: ISupplier = {
      name: data.name,
      type: data.type,
      governmentId: Number(data.governmentId),
      phone: data.phone,
      commercialRegister: data.commercialRegister,
      taxCard: data.taxCard,
      taxRegistrationNumber: data.taxRegistrationNumber,
    };

    if (supplier?.id) {
      editSupplierMutation(
        { id: supplier.id, data: payload },
        {
          onSuccess: () => router.push('/suppliers'),
        },
      );
    } else {
      createSupplierMutate(payload, {
        onSuccess: () => router.push('/suppliers'),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.type')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('placeholders.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierTypeValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="governmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.governorate')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('placeholders.governorate')} />
                    </SelectTrigger>
                    <SelectContent>
                      {governments?.map((gov) => (
                        <SelectItem key={gov.id} value={String(gov.id)}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.phone')} {...field} />
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
                <FormLabel>{t('fields.commercial-register')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.commercial-register')} {...field} />
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
                <FormLabel>{t('fields.tax-card')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.tax-card')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.tax-registration-number')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.tax-registration-number')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isCreateSupplierPending || isEditSupplierPending}>
            {(isCreateSupplierPending || isEditSupplierPending) && <Spinner className="mr-2" />}
            {t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
