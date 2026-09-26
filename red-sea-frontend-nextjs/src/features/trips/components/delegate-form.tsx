'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
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
import type { ITripResponse } from '../types/journey';
import type { ITrip } from '../types';
import { useGetAllUsers } from '@/apis/users/get-all';

interface DelegateFormProps {
  journeyId?: number;
}

/* -------------------------------------------------------------------------- */
/*                              Shared Constants                               */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM_VALUES: TripFormValues = {
  carId: '',
  trailerId: '',
  driverId: '',
  driverAssistantId: '',
  clientId: '',
  saleOrderNumber: '',
  deliveryCompany: '',
  direction: '',
  packingType: '',
  cementGrade: '',
  quantity: '',
  custodySourceId: '',
  custodyAmount: '',
};

/* -------------------------------------------------------------------------- */
/*                         Helper: Map API → Form                               */
/* -------------------------------------------------------------------------- */

function mapTripResponseToFormValues(trip: ITripResponse): TripFormValues {
  return {
    carId: trip.car?.id ? String(trip.car.id) : '',
    trailerId: trip.trailer?.id ? String(trip.trailer.id) : '',
    driverId: trip.driver?.id ? String(trip.driver.id) : '',
    driverAssistantId: trip.assistant?.id ? String(trip.assistant.id) : '',
    clientId: trip.client?.id
      ? (Object.entries(CLIENT_ID_MAP).find(([, id]) => id === trip.client!.id)?.[0] ?? '')
      : '',
    saleOrderNumber: trip.journey?.sellingOrderNo ?? '',
    deliveryCompany: trip.journey?.receivedCompany ?? '',
    direction: trip.journey?.direction ?? '',
    packingType: trip.journey?.packingType ?? '',
    cementGrade: trip.journey?.cementGrade ?? '',
    quantity:
      trip.journey?.quantity !== null && trip.journey?.quantity !== undefined
        ? String(trip.journey.quantity)
        : '',
    custodySourceId: trip.custodysource?.id ? String(trip.custodysource.id) : '',
    custodyAmount: '',
  };
}

/* -------------------------------------------------------------------------- */
/*                               Main Component                                */
/* -------------------------------------------------------------------------- */

export default function DelegateForm({ journeyId }: DelegateFormProps) {
  const router = useRouter();

  /* ------------------------------- Data Fetch ------------------------------ */

  const { cars } = useGetAllCars();
  const { trailers } = useGetAllTrailers();
  const { drivers } = useGetAllDrivers();
  const { employees: users } = useGetAllEmployees();
  const { users: assistants, isGetUsersPending: isPending } = useGetAllUsers();
  const isEditMode = journeyId !== undefined;

  const { tripResponse, isGetTripPending } = useGetOneTrip(journeyId ?? null, isEditMode);

  const { createTripDelegateMutation, isCreateTripDelegatePending } = useCreateTripDelegate();
  const { editTripDelegateMutation, isEditTripDelegateLoading } = useEditTripDelegate();

  const isSubmitting = isEditMode ? isEditTripDelegateLoading : isCreateTripDelegatePending;

  /* ------------------------------- Form Init -------------------------------- */

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  // const selectedClient = form.watch('clientId');
  // const selectedClientId = selectedClient
  //   ? CLIENT_ID_MAP[selectedClient as keyof typeof CLIENT_ID_MAP]
  //   : null;

  // const isWataniya = selectedClientId === 2;

  // useEffect(() => {
  //   if (isWataniya) {
  //     form.setValue('packingType', 'BAGGED', {
  //       shouldValidate: true,
  //       shouldDirty: true,
  //     });
  //   }
  // }, [isWataniya, form]);

  const isDataReady = useMemo(() => {
    return (
      !!tripResponse && !!cars?.length && !!trailers?.length && !!drivers?.length && !!users?.length
    );
  }, [tripResponse, cars, trailers, drivers, users]);

  /* --------------------------- Reset Form Logic ----------------------------- */

  useEffect(() => {
    if (isEditMode && isDataReady && tripResponse) {
      form.reset(mapTripResponseToFormValues(tripResponse));
    }

    if (!isEditMode) {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [isEditMode, isDataReady, tripResponse, form]);

  /* ------------------------------- Submit ----------------------------------- */

  const onSubmit = async (data: TripFormValues) => {
    const payload: ITrip = {
      id: journeyId,
      carId: Number(data.carId),
      trailerId: Number(data.trailerId),
      driverId: Number(data.driverId),
      driverAssistantId: Number(data.driverAssistantId),
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

    if (isEditMode) {
      await editTripDelegateMutation({ id: journeyId!, data: payload });
    } else {
      await createTripDelegateMutation(payload);
    }

    form.reset(DEFAULT_FORM_VALUES);
    router.push(`/trips`);
  };

  /* ------------------------------- Guards ----------------------------------- */

  if (isEditMode && isGetTripPending) {
    return <div className="p-4">Loading trip data...</div>;
  }

  /* ------------------------------- Render ----------------------------------- */

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
        {/* assistants  */}
        <FormField
          control={form.control}
          name="driverAssistantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مساعد :*</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر مساعد" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {assistants?.map((assistant) => (
                      <SelectItem key={assistant.id} value={String(assistant.id)}>
                        {assistant.username}
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
                    {PACKING_TYPES.map((p) => {
                      return (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      );
                    })}
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
          <Button type="submit" disabled={isSubmitting}>
            {isEditMode ? 'تحديث' : 'حفظ'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
        ;
      </form>
    </Form>
  );
}
