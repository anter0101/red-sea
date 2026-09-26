import { render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/ar/custody',
}));
jest.mock('@/utils/use-page-key', () => ({ usePageKey: () => 'custody' }));
jest.mock('@/components/main-table/api/get-one', () => ({
  useGetGridByPageKey: () => ({ gridConfig: null }),
}));
jest.mock('@/components/main-table/api/create', () => ({
  useCreateGrid: () => ({ createGridMutation: jest.fn() }),
}));
jest.mock('@/components/main-table/api/update', () => ({
  useUpdateGrid: () => ({ updateGridMutation: jest.fn() }),
}));
jest.mock('../custody-print-button', () => ({
  CustodyPrintButton: ({ journeyId }: { journeyId: number }) => (
    <button type="button">print-{journeyId}</button>
  ),
}));

import CustodyTable from '../custody-table';

const rows = [
  {
    id: 1,
    employeeName: 'Ahmed Ali',
    accountName: 'Acc',
    custodyAmount: '5000 EGP',
    journeyId: 12,
    journeyNumber: 'DEL-001',
    driverName: 'M H',
    driverLicense: 'LIC-1',
    driverAssistantName: 'Assistant',
    carPlate: '1234 أ ب',
    trailerPlate: '5678 د هـ',
    status: 'ACTIVE' as const,
    createdAt: '01/06/2026',
  },
];

it('renders a custody row and an empty state', () => {
  const { rerender } = render(<CustodyTable data={rows} />);
  expect(screen.getByText('Ahmed Ali')).toBeInTheDocument();
  expect(screen.getByText('DEL-001')).toBeInTheDocument();
  expect(screen.getByText('5000 EGP')).toBeInTheDocument();
  expect(screen.getByText('Assistant')).toBeInTheDocument();
  expect(screen.getByText('table.actions')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'print-12' })).toBeInTheDocument();

  rerender(<CustodyTable data={[]} />);
  expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
});
