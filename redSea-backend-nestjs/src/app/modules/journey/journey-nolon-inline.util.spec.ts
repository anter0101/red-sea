import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { mapNolonInlineCarToCreate, mapNolonInlineTrailerToCreate } from './journey-nolon-inline.util';

describe('mapNolonInlineCarToCreate', () => {
  it('maps only provided NOLON car fields without defaults', () => {
    const result = mapNolonInlineCarToCreate({
      plateNumber: '9901',
      plateLetters: 'ن ل ن',
      licenseNumber: 'LIC-NOLON-CAR-001',
      licenseExpiryDate: '2027-01-01',
    });

    expect(result).toEqual({
      ownerShip: OwnerShipType.NOLON_CAR,
      plateNumber: '9901',
      plateLetters: 'ن ل ن',
      licenseNumber: 'LIC-NOLON-CAR-001',
      licenseExpiryDate: '2027-01-01',
    });
    expect(result.manufacturer).toBeUndefined();
    expect(result.chassisNumber).toBeUndefined();
    expect(result.cylinders).toBeUndefined();
  });
});

describe('mapNolonInlineTrailerToCreate', () => {
  it('maps only provided NOLON trailer fields without fabricated defaults', () => {
    const result = mapNolonInlineTrailerToCreate({
      plateNumber: '9902',
      plateLetters: 'م ق ط',
      licenseNumber: 'LIC-NOLON-TRL-001',
      licenseExpiryDate: '2027-06-01',
    });

    expect(result).toEqual({
      ownerShip: OwnerShipType.NOLON_CAR,
      plateNumber: '9902',
      plateLetters: 'م ق ط',
      licenseNumber: 'LIC-NOLON-TRL-001',
      licenseExpiryDate: '2027-06-01',
    });
    expect(result.manufacturer).toBeUndefined();
    expect(result.chassisNumber).toBeUndefined();
    expect(result.chaseType).toBeUndefined();
  });
});
