import { toCustodyRow } from '../get-all';

it('maps a custody response to a flat table row', () => {
  const row = toCustodyRow({
    id: 1,
    employeeId: 3,
    accountId: 7,
    status: 'ACTIVE',
    custodyAmount: 5000,
    employee: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    account: { id: 7, name: 'Ahmed Ali' },
    journey: {
      id: 12,
      delegateNumber: 'DEL-001',
      driverAssistant: { firstName: 'Said', lastName: 'Omar' },
      car: { plateNumber: '1234', plateLetters: 'أ ب ج' },
      trailer: { plateNumber: '5678', plateLetters: 'د هـ' },
      driver: { licenseNumber: 'J-DRV-001', user: { firstName: 'Journey', lastName: 'Driver' } },
    },
    driver: { id: 5, licenseNumber: 'LIC-99', user: { firstName: 'Mahmoud', lastName: 'Hassan' } },
    createdAt: '2026-06-01T00:00:00.000Z',
  });
  expect(row).toMatchObject({
    id: 1,
    employeeName: 'Ahmed Ali',
    accountName: 'Ahmed Ali',
    custodyAmount: '5000 EGP',
    journeyId: 12,
    journeyNumber: 'DEL-001',
    driverName: 'Mahmoud Hassan',
    driverLicense: 'LIC-99',
    driverAssistantName: 'Said Omar',
    carPlate: '1234 أ ب ج',
    trailerPlate: '5678 د هـ',
    status: 'ACTIVE',
  });
});

it('maps journeyId from top-level journeyId field', () => {
  const row = toCustodyRow({
    id: 4,
    employeeId: 1,
    accountId: 2,
    journeyId: 99,
    status: 'ACTIVE',
  });
  expect(row.journeyId).toBe(99);
});

it('falls back to dashes when relations are missing', () => {
  const row = toCustodyRow({ id: 2, employeeId: 3, accountId: 7, status: 'CLOSED' });
  expect(row.employeeName).toBe('—');
  expect(row.custodyAmount).toBe('—');
  expect(row.journeyNumber).toBe('—');
  expect(row.driverName).toBe('—');
  expect(row.driverAssistantName).toBe('—');
});

it('uses journey driver when custody driver is missing', () => {
  const row = toCustodyRow({
    id: 3,
    employeeId: 1,
    accountId: 2,
    status: 'ACTIVE',
    journey: {
      driver: {
        licenseNumber: 'J-LIC',
        user: { firstName: 'Journey', lastName: 'Driver' },
      },
    },
  });
  expect(row.driverName).toBe('Journey Driver');
  expect(row.driverLicense).toBe('J-LIC');
});
