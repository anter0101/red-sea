import { driverInlineSchema, carInlineSchema, trailerInlineSchema } from '../office-journey-schema';

const validDriver = {
  licenseNumber: 'LIC-001',
  licenseExpiryDate: '2030-12-31',
  user: {
    firstName: 'Ali',
    lastName: 'Hassan',
    nationalId: '2002015000001',
    phoneNumber: '01001000100',
  },
};

const validCar = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC-CAR-001',
  licenseExpiryDate: '2027-01-01',
};

const validTrailer = {
  plateNumber: '9902',
  plateLetters: 'م ق ط',
  licenseNumber: 'LIC-TR-001',
  licenseExpiryDate: '2027-06-01',
};

describe('inline asset schemas', () => {
  it('accepts a valid inline driver', () => {
    expect(driverInlineSchema.safeParse(validDriver).success).toBe(true);
  });

  it('rejects a driver missing user.nationalId', () => {
    const { nationalId, ...userNoId } = validDriver.user;
    const bad = { ...validDriver, user: userNoId };
    expect(driverInlineSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a driver missing user.phoneNumber', () => {
    const { phoneNumber, ...userNoPhone } = validDriver.user;
    const bad = { ...validDriver, user: userNoPhone };
    expect(driverInlineSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a valid inline car and trailer', () => {
    expect(carInlineSchema.safeParse(validCar).success).toBe(true);
    expect(trailerInlineSchema.safeParse(validTrailer).success).toBe(true);
  });

  it('rejects a car missing licenseExpiryDate', () => {
    const { licenseExpiryDate, ...noExpiry } = validCar;
    expect(carInlineSchema.safeParse(noExpiry).success).toBe(false);
  });

  it('rejects a trailer missing plateNumber', () => {
    const { plateNumber, ...noPlate } = validTrailer;
    expect(trailerInlineSchema.safeParse(noPlate).success).toBe(false);
  });
});
