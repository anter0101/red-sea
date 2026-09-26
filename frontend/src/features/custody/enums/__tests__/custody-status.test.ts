import { CUSTODY_STATUSES } from '../custody-status';

it('lists the three custody statuses', () => {
  expect(CUSTODY_STATUSES).toEqual(['ACTIVE', 'INACTIVE', 'CLOSED']);
});
