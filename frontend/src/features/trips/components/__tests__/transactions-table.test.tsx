import { render, screen } from '@testing-library/react';

import TransactionsTable from '../transactions-table';

describe('TransactionsTable (journey financial activity)', () => {
  it('shows an empty message when there are no postings', () => {
    render(<TransactionsTable data={[]} />);
    expect(screen.getByText('لا توجد حركات مالية لهذه الرحلة')).toBeInTheDocument();
  });

  it('shows debit amounts in the debit column and credit amounts in the credit column', () => {
    render(
      <TransactionsTable
        data={[
          {
            id: 1,
            date: '2026-11-01',
            code: 'TX-1',
            description: 'diesel',
            accountCode: '5101',
            accountName: 'Diesel',
            entryType: 'DEBIT',
            amount: 1500,
          },
          {
            id: 2,
            date: '2026-11-01',
            code: 'TX-1',
            description: 'nolon',
            accountCode: '4101',
            accountName: 'Nolon',
            entryType: 'CREDIT',
            amount: 2000,
          },
        ]}
      />,
    );

    expect(screen.getAllByText('TX-1')).toHaveLength(2);
    expect(screen.getByText('5101 - Diesel')).toBeInTheDocument();
    expect(screen.getByText('4101 - Nolon')).toBeInTheDocument();
    expect(screen.getByText('diesel')).toBeInTheDocument();
    expect(screen.getByText('nolon')).toBeInTheDocument();
  });
});
