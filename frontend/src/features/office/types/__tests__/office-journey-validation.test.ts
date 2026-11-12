import { makeOfficeJourneySchema, emptyOfficeJourneyValues } from '../office-journey-schema';

const schema = makeOfficeJourneySchema(Infinity);

describe('officeJourneySchema', () => {
  it('requires clientId', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
    });
    expect(r.success).toBe(false);
  });

  it('NOLON passes with a selected car id', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      carId: '7',
      transportSupplierId: '12',
    });
    expect(r.success).toBe(true);
  });

  it.each(['NOLON_CAR', 'CONTRACT_CAR'] as const)(
    '%s fails without a transport supplier',
    (vehicleMode) => {
      const r = schema.safeParse({
        ...emptyOfficeJourneyValues,
        vehicleMode,
        clientId: '4',
        carId: '7',
      });
      expect(r.success).toBe(false);
      if (!r.success) {
        const issue = r.error.issues.find((i) => i.path.includes('transportSupplierId'));
        expect(issue?.message).toBe('مورد النقل مطلوب للنولون والعقد');
      }
    },
  );

  it('COMPANY passes without a transport supplier', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'COMPANY_CAR',
      clientId: '4',
      carId: '9',
    });
    expect(r.success).toBe(true);
  });

  it('NOLON passes with an inline car (no id)', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      transportSupplierId: '12',
      carInline: {
        plateNumber: '9901',
        plateLetters: 'ن',
        licenseNumber: 'L',
        licenseExpiryDate: '2027-01-01',
      },
    });
    expect(r.success).toBe(true);
  });

  it('CONTRACT fails without a car id', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'CONTRACT_CAR',
      clientId: '4',
    });
    expect(r.success).toBe(false);
  });
});

describe('makeOfficeJourneySchema — custodyAmount max validation', () => {
  const base = {
    ...emptyOfficeJourneyValues,
    vehicleMode: 'NOLON_CAR' as const,
    clientId: '4',
    carId: '7',
    transportSupplierId: '12',
  };

  it('empty custodyAmount is valid (field is optional)', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '' }).success).toBe(true);
  });

  it('value equal to max is valid', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '5000' }).success).toBe(true);
  });

  it('value below max is valid', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '4999' }).success).toBe(true);
  });

  it('value above max is invalid with Arabic error message', () => {
    const s = makeOfficeJourneySchema(5000);
    const r = s.safeParse({ ...base, custodyAmount: '5001' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const custodyError = r.error.issues.find((i) => i.path.includes('custodyAmount'));
      expect(custodyError?.message).toBe('لا يمكن أن يتجاوز 5000');
    }
  });
});
