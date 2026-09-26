/**
 * How the journey sources its vehicle (and related assets).
 * Must match {@link OwnerShipType} on cars/trailers for the same mode name.
 */
export enum JourneyVehicleMode {
  /** Rental / Nolon — inline create or select; ownerShip NOLON_CAR */
  NOLON_CAR = 'NOLON_CAR',
  /** Contract fleet — select existing; ownerShip CONTRACT_CAR */
  CONTRACT_CAR = 'CONTRACT_CAR',
  /** Company fleet — select existing; ownerShip COMPANY_CAR */
  COMPANY_CAR = 'COMPANY_CAR',
}
