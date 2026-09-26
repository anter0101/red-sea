'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import PlateInput from '@/components/common/plate-input';
import { VehicleColors } from '@/data/vehicle-colors';
import { OwnerShipTypes } from '@/enums/ownership';
import { VehicleStatus } from '@/enums/vehicle-status';
import { useBulkAssignOwners } from '@/features/cars/apis/bulk-assign-owners';
import { useCreateCar } from '@/features/cars/apis/create';
import { useUpdateCar } from '@/features/cars/apis/update';
import CarManufacturerDropDown from '@/features/cars/components/manufacturer';
import CarModelDropDown from '@/features/cars/components/model';
import type { ICar } from '@/types';
import { CarsSchema, type ICarsFormValues } from '@/features/cars/types';
import { cn } from '@/lib/utils';
import { formatPlateLettersForApi, compactPlateLetters } from '@/lib/plate-letters';
import { zodResolver } from '@hookform/resolvers/zod';

interface CarInformationFormProps {
  onNext: () => void;
  onPrevious: () => void;
  onFinish?: () => void;
  ownerShip: OwnerShipTypes;
  contractOwnerId?: number | null;
  setCarId?: (id: number | null) => void;
  car?: ICar;
  isCarLoading?: boolean;
}
const DEFAULT_AXLE_COUNT = 2;

const CarInformationForm = ({
  onNext,
  onPrevious,
  onFinish,
  ownerShip,
  contractOwnerId,
  setCarId,
  car,
  isCarLoading,
}: CarInformationFormProps) => {
  const t = useTranslations('cars');
  const tColors = useTranslations('common.vehicle-colors');
  const { createCarMutation, isCreateCarPending } = useCreateCar();
  const { updateCarMutation, isUpdateCarPending } = useUpdateCar();
  const { bulkAssignOwnersMutation, isBulkAssignOwnersPending } = useBulkAssignOwners();

  const isEditMode = !!car?.id;
  const isPending =
    isCreateCarPending || isUpdateCarPending || isBulkAssignOwnersPending;

  const defaultValues = useMemo(() => {
    return {
      manufacturer: car?.manufacturer || '',
      model: car?.model || '',
      status: car?.status === VehicleStatus.AVAILABLE,
      manufactureYear: car?.manufactureYear || undefined,
      color: car?.color || '',
      cylinders: car?.cylinders || undefined,
      horsepower: car?.horsepower || undefined,
      axleCount: car?.axleCount || DEFAULT_AXLE_COUNT,
      maxWeight: car?.maxWeight || undefined,
      plateNumber: car?.plateNumber || '',
      plateLetters: compactPlateLetters(car?.plateLetters ?? ''),
      chassisNumber: car?.chassisNumber || '',
      licenseNumber: car?.licenseNumber || '',
      licenseExpiryDate: car?.licenseExpiryDate ? new Date(car?.licenseExpiryDate) : undefined,
      notes: car?.notes || '',
    };
  }, [car]);

  const form = useForm<ICarsFormValues>({
    resolver: zodResolver(CarsSchema(t)),
    defaultValues: car
      ? defaultValues
      : {
          status: true,
          axleCount: 2,
        },
    mode: 'onChange',
  });

  useEffect(() => {
    if (car) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, car]);

  const onSubmit = (data: ICarsFormValues) => {
    const apiData = {
      ...data,
      ownerShip,
      plateLetters: formatPlateLettersForApi(data.plateLetters),
      status: data.status ? VehicleStatus.AVAILABLE : VehicleStatus.UNAVAILABLE,
      licenseExpiryDate: data.licenseExpiryDate ? format(data.licenseExpiryDate, 'yyyy-MM-dd') : '',
    };

    if (isEditMode) {
      updateCarMutation(
        { id: car.id, data: apiData },
        {
          onSuccess: () => {
            onNext();
          },
        },
      );
    } else {
      createCarMutation(apiData, {
        onSuccess: (createdCar) => {
          const newCarId = createdCar?.id;
          if (setCarId && newCarId) {
            setCarId(newCarId);
          }

          if (ownerShip === OwnerShipTypes.CONTRACT_CAR && contractOwnerId && newCarId) {
            bulkAssignOwnersMutation(
              {
                carId: newCarId,
                owners: [{ id: contractOwnerId, percentage: 100 }],
              },
              {
                onSuccess: () => onNext(),
              },
            );
            return;
          }

          onNext();
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Switch */}
        {/* <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('fields.activate-car')}</FormLabel>
                <FormDescription>{t('fields.activate-car-description')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manufacturer */}
          <CarManufacturerDropDown />

          {/* Model */}
          <CarModelDropDown />
        </div>

        {/* Manufacture Year */}
        <FormField
          control={form.control}
          name="manufactureYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.manufacture-year')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('placeholders.manufacture-year')}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.color')}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('placeholders.color')} />
                  </SelectTrigger>
                  <SelectContent>
                    {VehicleColors(tColors).map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cylinders */}
          <FormField
            control={form.control}
            name="cylinders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.cylinders')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('placeholders.cylinders')}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Horsepower */}
          <FormField
            control={form.control}
            name="horsepower"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.horsepower')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('placeholders.horsepower')}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Axle Count */}
          <FormField
            control={form.control}
            name="axleCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.axle-count')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('placeholders.axle-count')}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Weight */}
          <FormField
            control={form.control}
            name="maxWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.max-weight')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('placeholders.max-weight')}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plate Letters */}
          <FormField
            control={form.control}
            name="plateLetters"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('fields.plate-letters')}</FormLabel>
                <FormControl>
                  <PlateInput
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

          {/* Plate Number */}
          <FormField
            control={form.control}
            name="plateNumber"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('fields.plate-number')}</FormLabel>
                <FormControl>
                  <PlateInput
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

        {/* Chassis Number */}
        <FormField
          control={form.control}
          name="chassisNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.chassis-number')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.chassis-number')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Number */}
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

          {/* License Expiry Date */}
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
                        variant={'outline'}
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

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.notes')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('placeholders.notes')}
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

export default CarInformationForm;
