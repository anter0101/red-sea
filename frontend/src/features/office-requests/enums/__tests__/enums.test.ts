import { OFFICE_REQUEST_STATUSES } from '../office-request-status';
import { OFFICE_REQUEST_TYPES } from '../office-request-type';

it('lists statuses', () => {
  expect(OFFICE_REQUEST_STATUSES).toEqual(['PENDING', 'APPROVED', 'REJECTED']);
});

it('lists types', () => {
  expect(OFFICE_REQUEST_TYPES).toEqual([
    'PRINT_DELEGATION',
    'END_WORKING_SHIFT',
    'ASK_FOR_CUSTODY',
  ]);
});
