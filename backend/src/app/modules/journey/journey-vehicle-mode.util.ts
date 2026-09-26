import { BadRequestException } from '@nestjs/common';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

const MODE_TO_OWNERSHIP: Record<JourneyVehicleMode, OwnerShipType> = {
  [JourneyVehicleMode.NOLON_CAR]: OwnerShipType.NOLON_CAR,
  [JourneyVehicleMode.CONTRACT_CAR]: OwnerShipType.CONTRACT_CAR,
  [JourneyVehicleMode.COMPANY_CAR]: OwnerShipType.COMPANY_CAR,
};

export function expectedOwnerShipForMode(mode: JourneyVehicleMode): OwnerShipType {
  const expected = MODE_TO_OWNERSHIP[mode];
  if (!expected) {
    throw new BadRequestException(`Unsupported vehicle mode: ${mode}`);
  }
  return expected;
}

export function assertInlineCreateAllowed(mode: JourneyVehicleMode, asset: string): void {
  if (mode !== JourneyVehicleMode.NOLON_CAR) {
    throw new BadRequestException(
      `Inline ${asset} creation is only allowed for NOLON_CAR (rental) mode`,
    );
  }
}

export function assertVehicleOwnerShip(
  asset: 'Car' | 'Trailer',
  ownerShip: OwnerShipType | undefined,
  mode: JourneyVehicleMode,
): void {
  const expected = expectedOwnerShipForMode(mode);
  if (ownerShip !== expected) {
    throw new BadRequestException(
      `${asset} ownerShip must be ${expected} for ${mode} (got ${ownerShip ?? 'unset'})`,
    );
  }
}

export function assertVehicleAvailable(
  asset: 'Car' | 'Trailer',
  status: VeachleStatus,
  id: number,
): void {
  if (status === VeachleStatus.AVILABLE || status === VeachleStatus.ONROAD) {
    return;
  }
  throw new BadRequestException(
    `${asset} with id ${id} is not available (status: ${status})`,
  );
}

export function validateCarForMode(car: Car, mode: JourneyVehicleMode): void {
  assertVehicleOwnerShip('Car', car.ownerShip, mode);
  assertVehicleAvailable('Car', car.status, car.id);
}

export function validateTrailerForMode(trailer: Trailer, mode: JourneyVehicleMode): void {
  assertVehicleOwnerShip('Trailer', trailer.ownerShip, mode);
  assertVehicleAvailable('Trailer', trailer.status, trailer.id);
}
