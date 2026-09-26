import { custodyFormSchema } from '../index';

const valid = { employeeId: '3', accountId: '7', status: 'ACTIVE', journeyId: '', driverId: '' };

describe('custodyFormSchema', () => {
  it('accepts a valid custody (required employee + account)', () => {
    expect(custodyFormSchema.safeParse(valid).success).toBe(true);
  });

  it('requires employeeId and accountId', () => {
    expect(custodyFormSchema.safeParse({ ...valid, employeeId: '' }).success).toBe(false);
    expect(custodyFormSchema.safeParse({ ...valid, accountId: '' }).success).toBe(false);
  });

  it('allows optional journeyId and driverId to be empty', () => {
    const r = custodyFormSchema.safeParse({ ...valid, journeyId: '', driverId: '' });
    expect(r.success).toBe(true);
  });
});
