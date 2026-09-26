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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreatePartner } from '../api/create';
import { useEditPartner } from '../api/update';
import type { IPartner } from '../types';
import type { PartnerFormValues } from '../types/create-schema';
import { PartnerSchema } from '../types/create-schema';

interface PartnerFormProps {
  partner?: IPartner; // Edit mode
}

export const PartnerForm = ({ partner }: PartnerFormProps) => {
  const router = useRouter();
  const t = useTranslations('partners');

  const { createPartnerMutation, isCreatePartnerPending } = useCreatePartner();
  const { editPartnerMutation, isEditPartnerLoading } = useEditPartner();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      name: '',
      phone: '',
      transactionType: 'INSTAPAY',
      email: '',
      address: '',
    },
  });

  // Fill form if edit mode
  useEffect(() => {
    if (partner) {
      form.reset({
        name: partner.name ?? '',
        phone: partner.phone ?? '',
        transactionType: partner.transactionType ?? 'INSTAPAY',
        email: partner.email ?? '',
        address: partner.address ?? '',
      });
    }
  }, [partner]);

  const onSubmit = (data: PartnerFormValues) => {
    if (partner?.id) {
      // Edit mode
      editPartnerMutation(
        { id: partner.id, data },
        {
          onSuccess: () => router.push('/partners'),
        },
      );
    } else {
      // Create mode
      if (!data.phone) {
        return;
      }
      createPartnerMutation(data, {
        onSuccess: () => router.push('/partners'),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        {/* اسم الشريك */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الشريك</FormLabel>
              <FormControl>
                <Input placeholder="اسم الشريك" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* رقم الهاتف */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl>
                <Input placeholder="+20 1xx xxx xxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* طريقة التحويل */}
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>طريقة التحويل</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full text-right">
                    <SelectValue placeholder="اختر طريقة التحويل" />
                  </SelectTrigger>

                  <SelectContent className="text-right">
                    <SelectItem value="INSTAPAY">إنستاباي</SelectItem>
                    <SelectItem value="VODAFONE_CASH">فودافون كاش</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* البريد الإلكتروني */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="example@mail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* العنوان */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="العنوان بالتفصيل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>

          <Button type="submit" disabled={isCreatePartnerPending || isEditPartnerLoading}>
            {(isCreatePartnerPending || isEditPartnerLoading) && <Spinner className="mr-2" />}
            حفظ
          </Button>
        </div>
      </form>
    </Form>
  );
};
