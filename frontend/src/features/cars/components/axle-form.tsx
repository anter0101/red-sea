'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';

import { useCreateAxle } from '@/apis/axles/create';
import { useUpdateAxle } from '@/apis/axles/update';
import {
  SelectedTirePanel,
  VehicleChassisOverview,
  type SelectedTire,
  type TirePositionKey,
} from '@/components/common/axle-overview';
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
import TireModelDropdown from '@/features/cars/components/tire-model-dropdown';
import { CarAxleFormSchema } from '@/features/cars/types/car-axle-schema';
import {
  getTirePositionsForAxle,
  transformApiAxlesToForm,
  transformFormToApiPayload,
  transformFormToUpdatePayload,
} from '@/features/cars/utils/location-mapping';
import type { ICar } from '@/types';
import { cn } from '@/lib/utils';
import type { IAxleFormValues } from '@/types/axles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

interface AxleFormProps {
  onNext: () => void;
  onPrevious: () => void;
  carId: number | null;
  car?: ICar;
  isCarLoading?: boolean;
}

const DEFAULT_AXLE_COUNT = 2;

const POSITION_TRANSLATION_KEYS: Record<TirePositionKey, string> = {
  leftOuter: 'axles.positions.left-outer',
  leftInner: 'axles.positions.left-inner',
  rightOuter: 'axles.positions.right-outer',
  rightInner: 'axles.positions.right-inner',
};

const AxleForm = ({ onNext, onPrevious, carId, car, isCarLoading }: AxleFormProps) => {
  const t = useTranslations('cars');
  const queryClient = useQueryClient();
  const { createAxleMutation, isCreateAxlePending } = useCreateAxle();
  const { updateAxleMutation, isUpdateAxlePending } = useUpdateAxle();

  const isEditMode = car?.axles && car.axles.length > 0 && car.axles[0]?.id;
  const isPending = isCreateAxlePending || isUpdateAxlePending;

  const axleCount = car?.axleCount ?? DEFAULT_AXLE_COUNT;

  const firstPosition = getTirePositionsForAxle(0)[0] as TirePositionKey;
  const [selected, setSelected] = useState<SelectedTire>({
    axleIndex: 0,
    positionKey: firstPosition,
  });

  const schema = useMemo(() => CarAxleFormSchema(t), [t]);

  const getDefaultValues = (): IAxleFormValues => {
    if (!carId) {
      return {
        carId: 0,
        axles: [],
      };
    }

    return transformApiAxlesToForm(car?.axles, axleCount, carId);
  };

  const form = useForm<IAxleFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<IAxleFormValues>,
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const watchedAxles = form.watch('axles');

  useEffect(() => {
    if (carId) {
      const currentAxles = form.getValues('axles');
      if (car || currentAxles.length !== axleCount) {
        const formValues = transformApiAxlesToForm(car?.axles, axleCount, carId);
        form.reset(formValues);
      }
    }
  }, [car, carId, axleCount, form]);

  useEffect(() => {
    const available = getTirePositionsForAxle(selected.axleIndex) as TirePositionKey[];
    if (!available.includes(selected.positionKey)) {
      setSelected({ axleIndex: selected.axleIndex, positionKey: available[0] });
    }
  }, [selected.axleIndex, selected.positionKey, axleCount]);

  const onSubmit = (data: IAxleFormValues) => {
    if (isEditMode && car?.axles) {
      const bulkPayload = transformFormToUpdatePayload(data, car.axles);
      updateAxleMutation(bulkPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['cars'] });
          onNext();
        },
      });
    } else {
      const apiPayload = transformFormToApiPayload(data);
      createAxleMutation(apiPayload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['cars'] });
          onNext();
        },
      });
    }
  };

  const getSlotState = (axleIndex: number, position: TirePositionKey) => {
    const axle = watchedAxles?.[axleIndex];
    const filled = Boolean(
      axle?.serialNumber?.[position] ||
        axle?.type?.[position] ||
        (axle?.thickness?.[position] != null && axle.thickness[position] > 0),
    );

    const errors = form.formState.errors.axles?.[axleIndex];
    const hasError = Boolean(
      errors?.thickness?.[position] ||
        errors?.type?.[position] ||
        errors?.serialNumber?.[position] ||
        errors?.createdDate?.[position],
    );

    return { filled, hasError };
  };

  const handleVisibleAxleChange = useCallback((axleIndex: number) => {
    const positions = getTirePositionsForAxle(axleIndex) as TirePositionKey[];
    setSelected((prev) => {
      if (prev.axleIndex === axleIndex) return prev;
      const positionKey = positions.includes(prev.positionKey) ? prev.positionKey : positions[0];
      return { axleIndex, positionKey };
    });
  }, []);

  const { axleIndex, positionKey } = selected;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-18rem)] lg:min-h-[22rem] lg:grid-cols-2">
          <div className="h-[min(42dvh,20rem)] min-h-0 lg:h-full">
          <VehicleChassisOverview
            variant="truck"
            axleCount={axleCount}
            getPositionsForAxle={(index) => getTirePositionsForAxle(index) as TirePositionKey[]}
            getAxleTitle={(index) => t('axles.axle-header', { number: index + 1 })}
            selected={selected}
            getSlotState={getSlotState}
            getPositionLabel={(position) => t(POSITION_TRANSLATION_KEYS[position])}
            onSelect={setSelected}
            onVisibleAxleChange={handleVisibleAxleChange}
            hint={t('axles.overview-hint')}
          />
          </div>

          <div className="h-[min(42dvh,20rem)] min-h-0 lg:h-full">
          <SelectedTirePanel
            title={`${t('axles.selected-tire')} · ${t('axles.axle-header', { number: axleIndex + 1 })}`}
            positionLabel={t(POSITION_TRANSLATION_KEYS[positionKey])}
          >
            <FormField
              control={form.control}
              name={`axles.${axleIndex}.thickness.${positionKey}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{t('axles.fields.thickness')}</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        className="bg-white"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <span className="text-sm font-medium">%</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`axles.${axleIndex}.type.${positionKey}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{t('axles.fields.tire-type')}</FormLabel>
                  <FormControl>
                    <TireModelDropdown value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`axles.${axleIndex}.serialNumber.${positionKey}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">{t('axles.fields.serial-number')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('axles.placeholders.serial-number')}
                      className="bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`axles.${axleIndex}.createdDate.${positionKey}`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm">{t('axles.fields.installation-date')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal bg-white',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>{t('axles.placeholders.pick-date')}</span>
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
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`axles.${axleIndex}.updatedDate.${positionKey}`}
              render={({ field }) => (
                <>
                  {field.value && (
                    <FormItem className="flex items-center justify-between sm:col-span-2">
                      <FormLabel className="text-sm">{t('axles.fields.last-update-date')}</FormLabel>
                      <div>{format(field.value, 'PPP')}</div>
                    </FormItem>
                  )}
                </>
              )}
            />
          </SelectedTirePanel>
          </div>
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
            {isPending ? t('buttons.loading') : t('buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AxleForm;
