import { EMPTY_DISPLAY, orEmptyDisplay } from '@/lib/empty-display';
import { formatPlateLettersForDisplay } from '@/lib/plate-letters';import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

export interface ICarTableRow {
  id: string | number;
  carCode: string;
  manufacturer: string;
  model: string;
  status: string;
  year: number | string;
  color: string;
  axleCount: number | string;
  maxWeight: string;
  plateNumber: string;
  plateLetters: string;
  chassis: string;
  license: string;
  licenseExpiry: string;
  ownership: string;
  notes: string;
  addedBy: string;
}

interface CarsQueryParams extends IQueryParams {
  ownerShip?: string;
}

export function mapCarRow(car: any): ICarTableRow {
  return {
    id: car.id,
    carCode: orEmptyDisplay(car.code),
    manufacturer: orEmptyDisplay(car.manufacturer),
    model: orEmptyDisplay(car.model),
    status: orEmptyDisplay(car.status),
    year: orEmptyDisplay(car.manufactureYear),
    color: orEmptyDisplay(car.color),
    axleCount: car.axleCount ?? EMPTY_DISPLAY,
    maxWeight: car.maxWeight != null ? String(car.maxWeight) : EMPTY_DISPLAY,
    plateNumber: orEmptyDisplay(car.plateNumber),
    plateLetters: formatPlateLettersForDisplay(car.plateLetters),
    chassis: orEmptyDisplay(car.chassisNumber),
    license: orEmptyDisplay(car.licenseNumber),
    licenseExpiry: car.licenseExpiryDate
      ? new Date(car.licenseExpiryDate).toLocaleDateString('en-GB')
      : EMPTY_DISPLAY,
    ownership: orEmptyDisplay(car.ownerShip),
    notes: orEmptyDisplay(car.notes),
    addedBy: orEmptyDisplay(car.createdBy),
  };
}

export const useGetAllCars = (params?: CarsQueryParams) => {
  const { data, isPending: isGetCarsPending } = useGetPaginated({
    endPoint: '/api/cars',
    queryKey: ['cars'],
    params,
  });

  const cars = data?.data?.map(mapCarRow) ?? [];
  const totalCarsCount = data?.totalCount ?? 0;

  return { cars, isGetCarsPending, totalCarsCount };
};
