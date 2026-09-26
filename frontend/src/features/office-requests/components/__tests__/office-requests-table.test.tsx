import { fireEvent, render, screen } from '@testing-library/react';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import OfficeRequestsTable from '../office-requests-table';

const pendingRow = {
  id: 1,
  type: 'PRINT_DELEGATION' as const,
  status: 'PENDING' as const,
  journeyNumber: 'DEL-001',
  amount: '—',
  requestedAmount: null,
  fromName: 'A A',
  toName: 'S M',
  createdAt: '10/06/2026',
};

it('shows approve/reject only for PENDING rows when admin', () => {
  const onApprove = jest.fn();
  render(
    <OfficeRequestsTable
      data={[pendingRow]}
      isAdmin
      onApprove={onApprove}
      onReject={() => {}}
      onDelete={() => {}}
    />,
  );
  const approveBtn = screen.getByRole('button', { name: /rowActions\.approve/i });
  fireEvent.click(approveBtn);
  fireEvent.click(screen.getByRole('button', { name: /actions\.confirm/i }));
  expect(onApprove).toHaveBeenCalledWith(1);
});

it('hides approve/reject for terminal rows', () => {
  render(
    <OfficeRequestsTable
      data={[{ ...pendingRow, status: 'APPROVED' }]}
      isAdmin
      onApprove={() => {}}
      onReject={() => {}}
      onDelete={() => {}}
    />,
  );
  expect(screen.queryByRole('button', { name: /rowActions\.approve/i })).not.toBeInTheDocument();
});
