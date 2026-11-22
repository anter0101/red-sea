'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useGetAllCars } from '@/features/cars/api/get-all';
import { useGetAllClients } from '@/features/clients/api/get-all';
import { useGetAllDriverAssistants } from '@/features/driver-assistants/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllSuppliers } from '@/features/suppliers/api/get-all';
import { SupplierType } from '@/features/suppliers/enums/supplier-type';
import { useGetAllTrailers } from '@/features/trailers/api/get-all';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { useCreateOfficeJourney } from '../api/create-office-journey';
import { useGetOfficeCustodyAmount } from '../api/get-custody-amount';
import type { VehicleMode } from '../enums/vehicle-mode';
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  makeOfficeJourneySchema,
  type OfficeJourneyFormValues,
} from '../types/office-journey-schema';
import { filterByOwnership } from '../utils/filter-by-ownership';
import { clearOfficeJourneyDraft } from '../utils/office-journey-draft';

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
  const { suppliers: transportSuppliers } = useGetAllSuppliers({
    type: SupplierType.TRANSPORTATION,
    pageSize: 100,
  });
  const { data: session } = useSession();
  // Admins have no custody of their own: they pick the office and the employee it is taken from.
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const { createOfficeJourneyMutation, isCreateOfficeJourneyPending } = useCreateOfficeJourney();

  // The schema depends on the custody balance, which depends on a form value, so the resolver
  // reads the latest schema from a ref instead of the one captured when the form was created.
  const schemaRef = useRef(makeOfficeJourneySchema(Infinity));
  const resolver = useCallback<Resolver<OfficeJourneyFormValues>>(
    (values, context, options) => zodResolver(schemaRef.current)(values, context, options),
    [],
  );

  const form = useForm<OfficeJourneyFormValues>({
    resolver,
    defaultValues: { ...emptyOfficeJourneyValues, vehicleMode },
    mode: 'onChange',
  });

  const custodyEmployeeId = Number(useWatch({ control: form.control, name: 'custodyEmployeeId' }));
  const { custodyAmount: officeCustody, isCustodyAmountPending } = useGetOfficeCustodyAmount(
    isAdmin
      ? { enabled: custodyEmployeeId > 0, employeeId: custodyEmployeeId }
      : { enabled: !!session },
  );

  const max = officeCustody?.custodyAmount ?? Infinity;
  const schema = useMemo(
    () => makeOfficeJourneySchema(max, { requireCustodyEmployee: isAdmin }),
    [max, isAdmin],
  );
  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

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
    transportSuppliers,
    isAdmin,
  };
}
