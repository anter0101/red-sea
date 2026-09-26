import type { VehicleMode } from '../enums/vehicle-mode';

type OwnershipRow = {
  ownership?: string;
  ownerShip?: string;
};

function rowOwnership(row: OwnershipRow): string | undefined {
  return row.ownership ?? row.ownerShip;
}

export function filterByOwnership<T extends OwnershipRow>(rows: T[], mode: VehicleMode): T[] {
  return rows.filter((r) => rowOwnership(r) === mode);
}
