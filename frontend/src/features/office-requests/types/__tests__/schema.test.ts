import { officeRequestFormSchema, toOfficeRequestBody } from '../index';

const validPrintDelegation = {
  type: 'PRINT_DELEGATION',
  description: 'please print',
  journeyId: '12',
  amount: '',
};

const validNotes = {
  type: 'END_WORKING_SHIFT',
  description: 'shift done',
  journeyId: '',
  amount: '',
};

const validAskForCustody = {
  type: 'ASK_FOR_CUSTODY',
  description: '',
  journeyId: '',
  amount: '500',
};

describe('officeRequestFormSchema', () => {
  it('accepts PRINT_DELEGATION with a journeyId', () => {
    expect(officeRequestFormSchema.safeParse(validPrintDelegation).success).toBe(true);
  });

  it('rejects PRINT_DELEGATION without a journeyId', () => {
    expect(
      officeRequestFormSchema.safeParse({ ...validPrintDelegation, journeyId: '' }).success,
    ).toBe(false);
  });

  it('accepts END_WORKING_SHIFT without a journeyId', () => {
    expect(officeRequestFormSchema.safeParse(validNotes).success).toBe(true);
  });

  it('accepts ASK_FOR_CUSTODY with a positive amount', () => {
    expect(officeRequestFormSchema.safeParse(validAskForCustody).success).toBe(true);
  });

  it('rejects ASK_FOR_CUSTODY without an amount', () => {
    expect(
      officeRequestFormSchema.safeParse({ ...validAskForCustody, amount: '' }).success,
    ).toBe(false);
  });

  it('rejects ASK_FOR_CUSTODY with non-positive amount', () => {
    expect(
      officeRequestFormSchema.safeParse({ ...validAskForCustody, amount: '0' }).success,
    ).toBe(false);
    expect(
      officeRequestFormSchema.safeParse({ ...validAskForCustody, amount: '-10' }).success,
    ).toBe(false);
  });

  it('maps PRINT_DELEGATION to a numeric body and omits empty description', () => {
    const body = toOfficeRequestBody({ ...validPrintDelegation, description: '' });
    expect(body).toEqual({ type: 'PRINT_DELEGATION', journeyId: 12 });
  });

  it('maps ASK_FOR_CUSTODY with amount', () => {
    const body = toOfficeRequestBody(validAskForCustody);
    expect(body).toEqual({ type: 'ASK_FOR_CUSTODY', amount: 500 });
  });

  it('maps END_WORKING_SHIFT with description and no journeyId', () => {
    const body = toOfficeRequestBody(validNotes as any);
    expect(body).toEqual({ type: 'END_WORKING_SHIFT', description: 'shift done' });
  });
});
