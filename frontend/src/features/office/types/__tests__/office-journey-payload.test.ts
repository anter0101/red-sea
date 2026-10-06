import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  type OfficeJourneyFormValues,
} from '../office-journey-schema';

const base: OfficeJourneyFormValues = {
  ...emptyOfficeJourneyValues,
  clientId: '4',
  direction: 'Cairo',
  packingType: 'BAGGED',
  cementGrade: 'Grade 52',
  quantity: '100',
  custodyAmount: '500',
};

const carInline = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC',
  licenseExpiryDate: '2027-01-01',
};

describe('buildOfficeJourneyPayload', () => {
  it('NOLON: existing assets are sent as flat id fields, plus assistant/sellingOrderNo', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      carId: '7',
      trailerId: '5',
      driverId: '10',
      driverAssistantId: '3',
      sellingOrderNo: 'SO-1',
    });
    expect(payload).toMatchObject({
      vehicleMode: 'NOLON_CAR',
      clientId: 4,
      carId: 7,
      trailerId: 5,
      driverId: 10,
      driverAssistantId: 3,
      sellingOrderNo: 'SO-1',
      direction: 'Cairo',
      packingType: 'BAGGED',
      cementGrade: 'Grade 52',
      quantity: 100,
      custodyAmount: 500,
    });
  });

  it('NOLON: inline asset is wrapped in a create object', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      carInline,
    });
    expect(payload.car).toEqual({ create: carInline });
  });

  it('CONTRACT: existing car/trailer/driver + assistant + sellingOrderNo are all sent as flat id fields', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'CONTRACT_CAR',
      carId: '7',
      trailerId: '5',
      driverId: '10',
      driverAssistantId: '3',
      sellingOrderNo: 'SO-1',
    });
    expect(payload.carId).toBe(7);
    expect(payload.trailerId).toBe(5);
    expect(payload.driverId).toBe(10);
    expect(payload.driverAssistantId).toBe(3);
    expect(payload.sellingOrderNo).toBe('SO-1');
  });

  it('CONTRACT: inline car is IGNORED (never emits inline fields for non-NOLON)', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'CONTRACT_CAR',
      carInline,
      carId: '7',
    });
    expect(payload.carId).toBe(7);
    expect(payload.car).toBeUndefined();
  });

  it('omits empty optional fields', () => {
    const payload = buildOfficeJourneyPayload({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'COMPANY_CAR',
      clientId: '4',
      carId: '9',
    });
    expect(payload).toEqual({
      vehicleMode: 'COMPANY_CAR',
      clientId: 4,
      carId: 9,
    });
  });

  it('NOLON: inline driver is wrapped in a create object', () => {
    const driverInline = {
      licenseNumber: 'LIC-002',
      licenseExpiryDate: '2030-12-31',
      user: {
        firstName: 'Fatima',
        lastName: 'Ibrahim',
        nationalId: '2002015000001',
        phoneNumber: '01001000100',
      },
    };
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      driverInline,
    });
    expect(payload.driver).toEqual({ create: driverInline });
  });

});
