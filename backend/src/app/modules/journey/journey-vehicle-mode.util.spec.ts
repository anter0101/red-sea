import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import {
  expectedOwnerShipForMode,
  validateCarForMode,
  validateTrailerForMode,
  assertInlineCreateAllowed,
} from './journey-vehicle-mode.util';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

describe('journey-vehicle-mode.util', () => {
  it.each([
    [JourneyVehicleMode.NOLON_CAR, OwnerShipType.NOLON_CAR],
    [JourneyVehicleMode.CONTRACT_CAR, OwnerShipType.CONTRACT_CAR],
    [JourneyVehicleMode.COMPANY_CAR, OwnerShipType.COMPANY_CAR],
  ])('expectedOwnerShipForMode(%s) === %s', (mode, expected) => {
    expect(expectedOwnerShipForMode(mode)).toBe(expected);
  });

  it('validateCarForMode passes when ownerShip and status match', () => {
    const car = {
      id: 1,
      ownerShip: OwnerShipType.CONTRACT_CAR,
      status: VeachleStatus.AVILABLE,
    } as Car;
    expect(() => validateCarForMode(car, JourneyVehicleMode.CONTRACT_CAR)).not.toThrow();
  });

  it('validateCarForMode allows ONROAD status', () => {
    const car = {
      id: 1,
      ownerShip: OwnerShipType.NOLON_CAR,
      status: VeachleStatus.ONROAD,
    } as Car;
    expect(() => validateCarForMode(car, JourneyVehicleMode.NOLON_CAR)).not.toThrow();
  });

  it('validateCarForMode rejects UNAVAILABLE status', () => {
    const car = {
      id: 1,
      ownerShip: OwnerShipType.NOLON_CAR,
      status: VeachleStatus.UNAVILABLE,
    } as Car;
    expect(() => validateCarForMode(car, JourneyVehicleMode.NOLON_CAR)).toThrow(
      /Car with id 1 is not available/,
    );
  });

  it('validateTrailerForMode throws on ownerShip mismatch', () => {
    const trailer = {
      id: 2,
      ownerShip: OwnerShipType.COMPANY_CAR,
      status: VeachleStatus.AVILABLE,
    } as Trailer;
    expect(() => validateTrailerForMode(trailer, JourneyVehicleMode.CONTRACT_CAR)).toThrow(
      /Trailer ownerShip must be CONTRACT_CAR/,
    );
  });

  it('assertInlineCreateAllowed only permits NOLON_CAR', () => {
    expect(() => assertInlineCreateAllowed(JourneyVehicleMode.NOLON_CAR, 'car')).not.toThrow();
    expect(() => assertInlineCreateAllowed(JourneyVehicleMode.COMPANY_CAR, 'car')).toThrow(
      /only allowed for NOLON_CAR/,
    );
  });
});
