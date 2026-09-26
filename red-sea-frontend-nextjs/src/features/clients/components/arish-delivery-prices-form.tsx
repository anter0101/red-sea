'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

import { useCreateBulkDeliveryPrices } from '../api/create-bulk-delivery-prices';
import { PackingType, packingTypeLabels } from '../enums/packing-type';

// Mapping from PackingType enum to priceTypeId
const packingTypeToPriceTypeId: Record<PackingType, number> = {
  [PackingType.BAGGED]: 1,
  [PackingType.JUMBO_BAG]: 2,
  [PackingType.SILO10]: 3,
  [PackingType.SILO12]: 4,
  [PackingType.LOOSE]: 5,
};

interface ArishDeliveryPricesFormProps {
  clientId: string;
}

export default function ArishDeliveryPricesForm({ clientId }: ArishDeliveryPricesFormProps) {
  const router = useRouter();
  const t = useTranslations('clients.delivery-prices');
  const tButtons = useTranslations('clients.buttons');
  const [selectedGovId, setSelectedGovId] = useState<number | null>(null);

  const { governments } = useGetAllGovernments();
  const { areas } = useGetAllAreasByGovernment(selectedGovId);
  const { createBulkDeliveryPricesMutation, isCreateBulkDeliveryPricesPending } =
    useCreateBulkDeliveryPrices();

  // Zod schema for form validation with translations
  const arishFormSchema = z
    .object({
      governorateId: z.string().min(1, t('validation.governorate-required')),
      areaId: z.string().min(1, t('validation.area-required')),
      validFrom: z.date({ message: t('validation.valid-from-required') }),
      validTo: z.date({ message: t('validation.valid-to-required') }),
      prices: z.object({
        [PackingType.BAGGED]: z.string().optional(),
        [PackingType.JUMBO_BAG]: z.string().optional(),
        [PackingType.SILO10]: z.string().optional(),
        [PackingType.SILO12]: z.string().optional(),
        [PackingType.LOOSE]: z.string().optional(),
      }),
      nolonPrice: z.string().optional(),
    })
    .refine((data) => data.validTo > data.validFrom, {
      message: t('validation.valid-to-after-from'),
      path: ['validTo'],
    });

  type ArishFormValues = z.infer<typeof arishFormSchema>;

  const form = useForm<ArishFormValues>({
    resolver: zodResolver(arishFormSchema),
    defaultValues: {
      governorateId: '',
      areaId: '',
      validFrom: undefined,
      validTo: undefined,
      prices: {
        [PackingType.BAGGED]: '',
        [PackingType.JUMBO_BAG]: '',
        [PackingType.SILO10]: '',
        [PackingType.SILO12]: '',
        [PackingType.LOOSE]: '',
      },
      nolonPrice: '',
    },
  });

  // Reset areaId when governorate changes
  useEffect(() => {
    form.setValue('areaId', '');
  }, [selectedGovId, form]);

  const onSubmit = (data: ArishFormValues) => {
    const items = Object.entries(data.prices)
      .filter(([, price]) => price && Number(price) > 0)
      .map(([packingType, price]) => ({
        areaId: Number(data.areaId),
        priceTypeId: packingTypeToPriceTypeId[packingType as PackingType],
        basePrice: Number(price),
        additionalFees: 0,
        taxPrice: 0,
        nolonPrice: Number(data.nolonPrice) || 0,
        validFrom: format(data.validFrom, 'yyyy-MM-dd'),
        validTo: format(data.validTo, 'yyyy-MM-dd'),
        notes: `${packingType} - ${packingTypeLabels[packingType as PackingType]}`,
      }));

    if (items.length === 0) {
      form.setError('prices.BAGGED', {
        message: t('validation.at-least-one-price'),
      });
      return;
    }

    createBulkDeliveryPricesMutation(
      {
        clientId: Number(clientId),
        items,
      },
      {
        onSuccess: () => {
          router.push(`/clients/${clientId}`);
        },
      },
    );
  };

  const packingTypes = Object.values(PackingType);

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">{t('arish-title')}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Governorate Selection */}
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

            {/* Price Inputs for each Packing Type */}

            <div className="grid grid-cols-2 col-span-2 gap-6">
              {packingTypes.map((type) => (
                <FormField
                  key={type}
                  control={form.control}
                  name={`prices.${type}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{packingTypeLabels[type]}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" min="0" step="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
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
          <div className="flex gap-4">
            <Button type="submit" disabled={isCreateBulkDeliveryPricesPending}>
              {isCreateBulkDeliveryPricesPending ? t('saving') : t('save-prices')}
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
