import { VEHICLE_MODES, slugToVehicleMode, vehicleModeToSlug } from '../vehicle-mode';

describe('vehicle-mode', () => {
  it('lists the three backend modes', () => {
    expect(VEHICLE_MODES).toEqual(['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR']);
  });

  it('maps url slugs to enum values', () => {
    expect(slugToVehicleMode('nolon-car')).toBe('NOLON_CAR');
    expect(slugToVehicleMode('contract-car')).toBe('CONTRACT_CAR');
    expect(slugToVehicleMode('company-car')).toBe('COMPANY_CAR');
  });

  it('returns undefined for an unknown slug', () => {
    expect(slugToVehicleMode('bus')).toBeUndefined();
  });

  it('maps enum values back to slugs', () => {
    expect(vehicleModeToSlug('NOLON_CAR')).toBe('nolon-car');
  });
});
