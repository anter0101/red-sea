import type { CarDetailTableRow } from '@/features/cars/export-detail.config';

type CarLike = {
  id?: number;
  code?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  manufactureYear?: number;
  color?: string;
  maxWeight?: number;
  plateNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  ownerShip?: string;
  Ownerships?: unknown[];
  createdBy?: string;
};

export function mapCarToDetailTableRow(car: CarLike | null | undefined): CarDetailTableRow[] {
  if (!car?.id) return [];

  return [
    {
      id: String(car.id),
      carCode: car.code ?? '—',
      carNumber: car.plateNumber ?? '—',
      carType: car.manufacturer ?? '—',
      model: car.model ?? '—',
      licenseNumber: car.licenseNumber ?? '—',
      licenseExpiryDate: car.licenseExpiryDate
        ? new Date(car.licenseExpiryDate).toLocaleDateString('en-GB')
        : '—',
      color: car.color ?? '—',
      maxLoad: car.maxWeight ? `${car.maxWeight} طن` : '—',
      ownershipType: car.ownerShip ?? '—',
      partnersCount: car.Ownerships?.length ? String(car.Ownerships.length) : '—',
      driverName: '—',
      trailerNumber: '—',
      carStatus: car.status ?? '—',
      addedBy: car.createdBy ?? '—',
    },
  ];
}

export function mapTrailerToDetailTableRow(
  trailer: CarLike | null | undefined,
): CarDetailTableRow[] {
  if (!trailer?.id) return [];

  return [
    {
      id: String(trailer.id),
      carCode: trailer.code ?? '—',
      carNumber: trailer.plateNumber ?? '—',
      carType: trailer.manufacturer ?? '—',
      model: trailer.model ?? '—',
      licenseNumber: trailer.licenseNumber ?? '—',
      licenseExpiryDate: trailer.licenseExpiryDate
        ? new Date(trailer.licenseExpiryDate).toLocaleDateString('en-GB')
        : '—',
      color: trailer.color ?? '—',
      maxLoad: trailer.maxWeight ? `${trailer.maxWeight} طن` : '—',
      ownershipType: trailer.ownerShip ?? '—',
      partnersCount: trailer.Ownerships?.length ? String(trailer.Ownerships.length) : '—',
      driverName: '—',
      trailerNumber: trailer.plateNumber ?? '—',
      carStatus: trailer.status ?? '—',
      addedBy: trailer.createdBy ?? '—',
    },
  ];
}
