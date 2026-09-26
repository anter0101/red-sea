'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useGetAllAreasByGovernment } from '@/apis/areas/get-all-areas';
import { useGetAllGovernments } from '@/apis/governments/get-all-governments';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateDeliveryPrice } from '../api/create-delivery-price';

interface WataneyaDeliveryPricesFormProps {
  clientId: string;
}

export default function WataneyaDeliveryPricesForm({ clientId }: WataneyaDeliveryPricesFormProps) {
  const router = useRouter();
  const t = useTranslations('clients.delivery-prices');
  const tButtons = useTranslations('clients.buttons');
  const [selectedGovId, setSelectedGovId] = useState<number | null>(null);

  const { governments } = useGetAllGovernments();
  const { areas } = useGetAllAreasByGovernment(selectedGovId);
  const { createDeliveryPriceMutation, isCreateDeliveryPricePending } = useCreateDeliveryPrice();

  // Zod schema for form validation with translations
  const wataneyaFormSchema = z
    .object({
      governorateId: z.string().min(1, t('validation.governorate-required')),
      areaId: z.string().min(1, t('validation.area-required')),
      validFrom: z.date({ message: t('validation.valid-from-required') }),
      validTo: z.date({ message: t('validation.valid-to-required') }),
      basePrice: z.string().min(1, t('validation.base-price-required')),
      additionalFees: z.string().min(1, t('validation.additional-fees-required')),
      taxPrice: z.string().min(1, t('validation.tax-price-required')),
      nolonPrice: z.string().optional(),
    })
    .refine((data) => data.validTo > data.validFrom, {
      message: t('validation.valid-to-after-from'),
      path: ['validTo'],
    });

  type WataneyaFormValues = z.infer<typeof wataneyaFormSchema>;

  const form = useForm<WataneyaFormValues>({
    resolver: zodResolver(wataneyaFormSchema),
    defaultValues: {
      governorateId: '',
      areaId: '',
      validFrom: undefined,
      validTo: undefined,
      basePrice: '',
      additionalFees: '',
      taxPrice: '',
      nolonPrice: '',
    },
  });

  // Watch price fields to calculate total
  const basePrice = useWatch({ control: form.control, name: 'basePrice' });
  const additionalFees = useWatch({
    control: form.control,
    name: 'additionalFees',
  });
  const taxPrice = useWatch({ control: form.control, name: 'taxPrice' });

  const totalPrice =
    (Number(basePrice) || 0) + (Number(additionalFees) || 0) + (Number(taxPrice) || 0);

  // Reset areaId when governorate changes
  useEffect(() => {
    form.setValue('areaId', '');
  }, [selectedGovId, form]);

  const onSubmit = (data: WataneyaFormValues) => {
    createDeliveryPriceMutation(
      {
        clientId: Number(clientId),
        priceTypeId: 1, // Always BAGGED for Wataneya
        areaId: Number(data.areaId),
        basePrice: Number(data.basePrice),
        additionalFees: Number(data.additionalFees),
        taxPrice: Number(data.taxPrice),
        totalPrice: totalPrice,
        nolonPrice: Number(data.nolonPrice) || 0,
        validFrom: format(data.validFrom, 'yyyy-MM-dd'),
        validTo: format(data.validTo, 'yyyy-MM-dd'),
        notes: 'BAGGED - تسعير للمنتجات المعبأة في شكاير',
      },
      {
        onSuccess: () => {
          router.push(`/clients/${clientId}`);
        },
      },
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">{t('wataneya-title')}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Governorate Selection */}
          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="governorateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('governorate')}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedGovId(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('select-governorate')} />
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

            {/* Area Selection */}
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('area')}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedGovId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('select-area')} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas?.map((area) => (
                          <SelectItem key={area.id} value={String(area.id)}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            {/* Valid From */}
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('valid-from')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-right font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ar })
                          ) : (
                            <span>{t('select-date')}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid To */}
            <FormField
              control={form.control}
              name="validTo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('valid-to')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-right font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ar })
                          ) : (
                            <span>{t('select-date')}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Fields */}

            {/* Base Price (مطالبة) */}
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('base-price')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Fees (نقل بالطن) */}
            <FormField
              control={form.control}
              name="additionalFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('additional-fees')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax Price (ض ق م) */}
            <FormField
              control={form.control}
              name="taxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tax-price')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Price (اجمالي) - Display Only */}
            <div className="space-y-2">
              <FormLabel>{t('total-price')}</FormLabel>
              <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-1 text-sm">
                {totalPrice.toFixed(2)}
              </div>
            </div>

            <FormField
              control={form.control}
              name="nolonPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nolon-price')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isCreateDeliveryPricePending}>
              {isCreateDeliveryPricePending ? t('saving') : t('save-prices')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/clients/${clientId}`)}
            >
              {tButtons('cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
