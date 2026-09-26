import { toOfficeRequestRow } from '../get-all';

it('maps a response to a flat row', () => {
  const row = toOfficeRequestRow({
    id: 1,
    type: 'PRINT_DELEGATION',
    status: 'PENDING',
    journey: { id: 12, delegateNumber: 'DEL-001' },
    requestedFrom: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    requestedTo: { id: 5, user: { firstName: 'Sara', lastName: 'Mohamed' } },
    createdAt: '2026-06-10T09:00:00.000Z',
  });
  expect(row).toMatchObject({
    id: 1,
    type: 'PRINT_DELEGATION',
    status: 'PENDING',
    journeyNumber: 'DEL-001',
    amount: '—',
    requestedAmount: null,
    fromName: 'Ahmed Ali',
    toName: 'Sara Mohamed',
  });
});

it('maps ASK_FOR_CUSTODY amount from response amount field', () => {
  const row = toOfficeRequestRow({
    id: 2,
    type: 'ASK_FOR_CUSTODY',
    status: 'PENDING',
    amount: 750,
    requestedFrom: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    requestedTo: { id: 5, user: { firstName: 'Sara', lastName: 'Mohamed' } },
  });
  expect(row.amount).toBe('750 EGP');
  expect(row.requestedAmount).toBe(750);
});

it('maps ASK_FOR_CUSTODY amount from description when amount field is missing', () => {
  const row = toOfficeRequestRow({
    id: 3,
    type: 'ASK_FOR_CUSTODY',
    status: 'PENDING',
    description: '500',
    requestedFrom: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    requestedTo: { id: 5, user: { firstName: 'Sara', lastName: 'Mohamed' } },
  });
  expect(row.amount).toBe('500 EGP');
  expect(row.requestedAmount).toBe(500);
});
