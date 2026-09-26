import { filterByOwnership } from '../../utils/filter-by-ownership';

const cars = [
  { id: 1, ownership: 'NOLON_CAR' },
  { id: 2, ownership: 'CONTRACT_CAR' },
  { id: 3, ownership: 'COMPANY_CAR' },
];

it('keeps only cars whose ownership matches the mode', () => {
  expect(filterByOwnership(cars, 'NOLON_CAR').map((c) => c.id)).toEqual([1]);
  expect(filterByOwnership(cars, 'CONTRACT_CAR').map((c) => c.id)).toEqual([2]);
});

it('returns all rows when ownership data is absent', () => {
  const noOwnership = [{ id: 9, ownership: '—' }];
  expect(filterByOwnership(noOwnership, 'NOLON_CAR')).toEqual([]);
});

it('matches trailer ownerShip field as well as ownership', () => {
  const trailers = [
    { id: 1, ownerShip: 'NOLON_CAR' },
    { id: 2, ownership: 'CONTRACT_CAR' },
  ];
  expect(filterByOwnership(trailers, 'NOLON_CAR').map((t) => t.id)).toEqual([1]);
});
