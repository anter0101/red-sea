'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

import { useGetAllCars } from '@/features/cars/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllEmployees } from '@/features/employees/api/get-all';
import { useGetAllTrailers } from '@/features/trailers/api/get-all';

import { useCreateTripDelegate } from '../api/create/create-delegate';
import { useEditTripDelegate } from '../api/update/update-delegate';
import { useGetOneTrip } from '../api/get-one/get-one';

import { CEMENT_GRADES, PACKING_TYPES, CLIENTS, CLIENT_ID_MAP, CLIENT_LABELS } from '../constants';
import { tripSchema, type TripFormValues } from '../types/delegate-schema';
import { ITripResponse } from '../types/journey';
import { ITrip } from '../types';

interface DelegateFormProps {
  journeyId?: number;
}

export default function DelegateForm({ journeyId }: DelegateFormProps) {
  const router = useRouter();

  const { cars } = useGetAllCars();
  const { trailers } = useGetAllTrailers();
  const { drivers } = useGetAllDrivers();
  const { employees: users } = useGetAllEmployees();

  const mode = journeyId ? 'edit' : 'create';
  const isEdit = journeyId !== null && journeyId !== undefined;

  const { tripResponse, isGetTripPending } = useGetOneTrip(journeyId ?? null, isEdit);

  const { createTripDelegateMutation, isCreateTripDelegatePending } = useCreateTripDelegate();
  const { editTripDelegateMutation, isEditTripDelegateLoading } = useEditTripDelegate();

  const isLoading = journeyId ? isEditTripDelegateLoading : isCreateTripDelegatePending;

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      carId: '',
      trailerId: '',
      driverId: '',
      clientId: '',
      saleOrderNumber: '',
      deliveryCompany: '',
      direction: '',
      packingType: '',
      cementGrade: '',
      quantity: '',
      custodySourceId: '',
      custodyAmount: '',
    },
  });

  const selectedClient = form.watch('clientId');

  const isDataReady =
    tripResponse && cars?.length && trailers?.length && drivers?.length && users?.length;

  useEffect(() => {
    if (mode === 'edit' && isDataReady) {
      form.reset({
        carId: tripResponse?.car?.id ? String(tripResponse.car.id) : '',
        trailerId: tripResponse?.trailer?.id ? String(tripResponse.trailer.id) : '',
        driverId: tripResponse?.driver?.id ? String(tripResponse.driver.id) : '',
        clientId: tripResponse?.client?.id
          ? (Object.entries(CLIENT_ID_MAP).find(([_, id]) => id === tripResponse.client!.id)?.[0] ??
            '')
          : '',
        saleOrderNumber: tripResponse?.journey?.sellingOrderNo ?? '',
        deliveryCompany: tripResponse?.journey?.receivedCompany ?? '',
        direction: tripResponse?.journey?.direction ?? '',
        packingType: tripResponse?.journey?.packingType ?? '',
        cementGrade: tripResponse?.journey?.cementGrade ?? '',
        quantity:
          tripResponse?.journey?.quantity != null ? String(tripResponse.journey.quantity) : '',
        custodySourceId: tripResponse?.custodysource?.id
          ? String(tripResponse.custodysource.id)
          : '',
      });
    } else if (mode === 'create') {
      form.reset({
        carId: '',
        trailerId: '',
        driverId: '',
        clientId: '',
        saleOrderNumber: '',
        deliveryCompany: '',
        direction: '',
        packingType: '',
        cementGrade: '',
        quantity: '',
        custodySourceId: '',
        custodyAmount: '',
      });
    }
  }, [mode, isDataReady, form]);

  const onSubmit = async (data: TripFormValues) => {
    try {
      const payload: ITrip = {
        id: journeyId,
        carId: Number(data.carId),
        trailerId: Number(data.trailerId),
        driverId: Number(data.driverId),
        driverAssistantId: tripResponse?.assistant?.id ?? null,
        clientId: CLIENT_ID_MAP[data.clientId as keyof typeof CLIENT_ID_MAP],
        custodySourceId: Number(data.custodySourceId),
        custodyAmount: Number(data.custodyAmount),
        direction: data.direction!,
        packingType: data.packingType!,
        cementGrade: data.cementGrade!,
        quantity: Number(data.quantity),
        deliveryCompany: data.deliveryCompany || undefined,
        saleOrderNumber: data.saleOrderNumber || undefined,
      };

      if (mode === 'create') {
        await createTripDelegateMutation(payload);
      } else {
        await editTripDelegateMutation({ id: journeyId, data: payload });
      }

      form.reset();
      router.push(`/trips/${journeyId}`);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} trip:`, error);
    }
  };

  if (journeyId && isGetTripPending) {
    return <div>Loading...</div>;
  }

  const handleCancel = () => {
    form.reset();
    router.back();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="carId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السيارة :*</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر السيارة" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {cars?.map((car) => (
                      <SelectItem key={car.id} value={String(car.id)}>
                        {car.carCode} - {car.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Trailer */}
        <FormField
          control={form.control}
          name="trailerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المقطورة :*</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المقطورة" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {trailers?.map((trailer) => (
                      <SelectItem key={trailer.id} value={String(trailer.id)}>
                        {trailer.chassisNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Driver */}
        <FormField
          control={form.control}
          name="driverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السائق :*</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر السائق" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={String(driver.id)}>
                        {driver.driverName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Client */}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التحميل لصالح :*</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {Object.values(CLIENTS).map((client) => (
                      <SelectItem key={client} value={client}>
                        {CLIENT_LABELS[client]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Conditional Fields (ARISH only) */}
        {selectedClient === CLIENTS.ARISH && (
          <>
            <FormField
              control={form.control}
              name="saleOrderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أمر بيع رقم :</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>لتسليمها لشركة :</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {/* Direction */}
        <FormField
          control={form.control}
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجهة :</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Packing Type */}
        <FormField
          control={form.control}
          name="packingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع التعبئة :</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر نوع التعبئة" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {PACKING_TYPES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Cement Grade */}
        <FormField
          control={form.control}
          name="cementGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رتبة الأسمنت :</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر رتبة الأسمنت" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CEMENT_GRADES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الكمية :</FormLabel>
              <FormControl>
                <Input placeholder="بالطن" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Custody Source */}
        <FormField
          control={form.control}
          name="custodySourceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مصدر العهدة :</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المصدر" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Custody Amount */}
        <FormField
          control={form.control}
          name="custodyAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>قيمة العهدة :</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {journeyId ? 'تحديث' : 'حفظ'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
}
