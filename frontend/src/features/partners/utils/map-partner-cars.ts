import type { CarDetailTableRow } from '@/features/cars/export-detail.config';
import type { PartnerApi } from '@/features/partners/types';

export function mapPartnerCarsToDetailRows(partner: PartnerApi | null | undefined): CarDetailTableRow[] {
  if (!partner?.carOwnerships?.length) return [];

  return partner.carOwnerships.map((ownership) => {
    const car = ownership.car;
    return {
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
      maxLoad: car.maxWeight ? `${car.maxWeight} KG` : '—',
      ownershipType: car.ownerShip ?? '—',
      partnersCount: car.Ownerships?.length ? String(car.Ownerships.length) : '—',
      driverName: '—',
      trailerNumber: '—',
      carStatus: car.status ?? '—',
      addedBy: car.createdBy ?? '—',
    };
  });
}
