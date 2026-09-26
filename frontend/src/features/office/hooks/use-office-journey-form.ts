'use client';

import { useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useGetAllCars } from '@/features/cars/api/get-all';
import { useGetAllClients } from '@/features/clients/api/get-all';
import { useGetAllDriverAssistants } from '@/features/driver-assistants/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllTrailers } from '@/features/trailers/api/get-all';

import { useCreateOfficeJourney } from '../api/create-office-journey';
import { useGetOfficeCustodyAmount } from '../api/get-custody-amount';
import type { VehicleMode } from '../enums/vehicle-mode';
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  makeOfficeJourneySchema,
  type OfficeJourneyFormValues,
} from '../types/office-journey-schema';
import { clearOfficeJourneyDraft } from '../utils/office-journey-draft';
import { filterByOwnership } from '../utils/filter-by-ownership';

export function useOfficeJourneyForm(
  vehicleMode: VehicleMode,
  onCreated: (journeyId: number) => void,
) {
  const queryClient = useQueryClient();
  const { cars } = useGetAllCars({ ownerShip: vehicleMode, pageSize: 100 });
  const { trailers } = useGetAllTrailers({ ownerShip: vehicleMode, pageSize: 100 });
  const { drivers } = useGetAllDrivers();
  const { clients } = useGetAllClients();
  const { driverAssistants, isGetDriverAssistantsPending } = useGetAllDriverAssistants();
  const { custodyAmount: officeCustody, isCustodyAmountPending } = useGetOfficeCustodyAmount();
  const { createOfficeJourneyMutation, isCreateOfficeJourneyPending } = useCreateOfficeJourney();

  const max = officeCustody?.custodyAmount ?? Infinity;
  const schema = useMemo(() => makeOfficeJourneySchema(max), [max]);

  const form = useForm<OfficeJourneyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyOfficeJourneyValues, vehicleMode },
    mode: 'onChange',
  });

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['office-custody-amount'] });

    const onFocus = () => {
      void queryClient.invalidateQueries({ queryKey: ['office-custody-amount'] });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [queryClient]);

  const filteredCars = useMemo(
    () => filterByOwnership(cars ?? [], vehicleMode),
    [cars, vehicleMode],
  );
  const filteredTrailers = useMemo(
    () => filterByOwnership(trailers ?? [], vehicleMode),
    [trailers, vehicleMode],
  );

  const submitFn = (values: OfficeJourneyFormValues) => {
    const payload = buildOfficeJourneyPayload(values);
    createOfficeJourneyMutation(payload, {
      onSuccess: (data) => {
        clearOfficeJourneyDraft();
        form.reset({ ...emptyOfficeJourneyValues, vehicleMode });
        onCreated(data.id);
      },
    });
  };

  return {
    form,
    onSubmit: form.handleSubmit(submitFn, () => toast.error('يرجى تعبئة الحقول المطلوبة')),
    isSubmitting: isCreateOfficeJourneyPending,
    cars: filteredCars,
    trailers: filteredTrailers,
    drivers: drivers ?? [],
    clients: clients ?? [],
    driverAssistants: driverAssistants ?? [],
    isGetDriverAssistantsPending,
    officeCustody,
    isCustodyAmountPending,
  };
}
