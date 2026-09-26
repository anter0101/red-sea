'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import PlateInput from '@/components/common/plate-input';
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
import { useCreateCar } from '@/features/cars/apis/create';
import { useUpdateCar } from '@/features/cars/apis/update';
import { NolonCarSchema, type INolonCarFormValues } from '@/features/cars/types';
import { buildNolonCarMutationPayload, compactPlateLetters } from '@/features/cars/utils/nolon-car-payload';
import type { ICar } from '@/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

interface NolonCarInformationFormProps {
  onPrevious: () => void;
  onFinish?: () => void;
  setCarId?: (id: number | null) => void;
  car?: ICar;
  isCarLoading?: boolean;
}

export default function NolonCarInformationForm({
  onPrevious,
  onFinish,
  setCarId,
  car,
  isCarLoading,
}: NolonCarInformationFormProps) {
  const t = useTranslations('cars');
  const { createCarMutation, isCreateCarPending } = useCreateCar();
  const { updateCarMutation, isUpdateCarPending } = useUpdateCar();

  const isEditMode = !!car?.id;
  const isPending = isCreateCarPending || isUpdateCarPending;

  const defaultValues = useMemo(
    (): INolonCarFormValues => ({
      plateNumber: car?.plateNumber ?? '',
      plateLetters: compactPlateLetters(car?.plateLetters ?? ''),
      licenseNumber: car?.licenseNumber ?? '',
      licenseExpiryDate: car?.licenseExpiryDate
        ? new Date(car.licenseExpiryDate)
        : (undefined as unknown as Date),
    }),
    [car],
  );

  const form = useForm<INolonCarFormValues>({
    resolver: zodResolver(NolonCarSchema(t)),
    defaultValues: {
      plateNumber: '',
      plateLetters: '',
      licenseNumber: '',
      licenseExpiryDate: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (car) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, car]);

  const onSubmit = (data: INolonCarFormValues) => {
    const payload = buildNolonCarMutationPayload(data);

    if (isEditMode) {
      updateCarMutation(
        { id: car.id, data: payload },
        { onSuccess: () => onFinish?.() },
      );
      return;
    }

    createCarMutation(payload, {
      onSuccess: (createdCar) => {
        if (setCarId && createdCar?.id) {
          setCarId(createdCar.id);
        }
        onFinish?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold text-right">{t('ownership.types.NOLON_CAR')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
          <FormField
            control={form.control}
            name="plateLetters"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('fields.plate-letters')}</FormLabel>
                <FormControl>
                  <PlateInput
                    key="nolon-plate-letters"
                    value={field.value || ''}
                    onChange={field.onChange}
                    length={3}
                    type="letters"
                    placeholder=""
                    error={!!fieldState.error}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plateNumber"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('fields.plate-number')}</FormLabel>
                <FormControl>
                  <PlateInput
                    key="nolon-plate-number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    length={4}
                    type="numbers"
                    placeholder=""
                    error={!!fieldState.error}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.license-number')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.license-number')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseExpiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.license-expiry-date')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
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

        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isPending || isCarLoading}
          >
            {t('buttons.previous')}
          </Button>
          <Button type="submit" disabled={isPending || isCarLoading}>
            {isPending ? t('buttons.loading') : t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
