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
import { useCreateTrailer } from '@/features/trailers/apis/create';
import { useUpdateTrailer } from '@/features/trailers/apis/update';
import { NolonTrailerSchema, type INolonTrailerFormValues } from '@/features/trailers/types';
import {
  buildNolonTrailerMutationPayload,
  compactPlateLetters,
} from '@/features/trailers/utils/nolon-trailer-payload';
import type { ITrailer } from '@/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

interface NolonTrailerInformationFormProps {
  onPrevious: () => void;
  onFinish?: () => void;
  setTrailerId?: (id: number | null) => void;
  trailer?: ITrailer;
  isTrailerLoading?: boolean;
}

export default function NolonTrailerInformationForm({
  onPrevious,
  onFinish,
  setTrailerId,
  trailer,
  isTrailerLoading,
}: NolonTrailerInformationFormProps) {
  const t = useTranslations('trailers');
  const { createTrailerMutation, isCreateTrailerPending } = useCreateTrailer();
  const { updateTrailerMutation, isUpdateTrailerPending } = useUpdateTrailer();

  const isEditMode = !!trailer?.id;
  const isPending = isCreateTrailerPending || isUpdateTrailerPending;

  const defaultValues = useMemo(
    (): INolonTrailerFormValues => ({
      plateNumber: trailer?.plateNumber ?? '',
      plateLetters: compactPlateLetters(trailer?.plateLetters ?? ''),
      licenseNumber: trailer?.licenseNumber ?? '',
      licenseExpiryDate: trailer?.licenseExpiryDate
        ? new Date(trailer.licenseExpiryDate)
        : (undefined as unknown as Date),
    }),
    [trailer],
  );

  const form = useForm<INolonTrailerFormValues>({
    resolver: zodResolver(NolonTrailerSchema(t)),
    defaultValues: {
      plateNumber: '',
      plateLetters: '',
      licenseNumber: '',
      licenseExpiryDate: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (trailer) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, trailer]);

  const onSubmit = (data: INolonTrailerFormValues) => {
    const payload = buildNolonTrailerMutationPayload(data);

    if (isEditMode) {
      updateTrailerMutation(
        { id: trailer.id, data: payload },
        { onSuccess: () => onFinish?.() },
      );
      return;
    }

    createTrailerMutation(payload, {
      onSuccess: (createdTrailer) => {
        if (setTrailerId && createdTrailer?.id) {
          setTrailerId(createdTrailer.id);
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
                    key="nolon-trailer-plate-letters"
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
                    key="nolon-trailer-plate-number"
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
            disabled={isPending || isTrailerLoading}
          >
            {t('buttons.previous')}
          </Button>
          <Button type="submit" disabled={isPending || isTrailerLoading}>
            {isPending ? t('buttons.loading') : t('buttons.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
