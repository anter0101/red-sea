import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IAuditFields } from '@/types/audit-fields';

export const TripTransactionCategoryLabels: Record<string, string> = {
  'Office Fees': 'الرسوم المكتبية',
  'Loading Fees': 'رسوم التحميل',
  'Weighing Fees': 'رسوم الوزن',
  'Card Fees': 'رسوم الكارته',
  'Crossing Fees': 'رسوم المعابر',
  'Port Permit Fees': 'رسوم تصريح الميناء',
  'Port Fees': 'رسوم الميناء',
  'Diesel Fees': 'رسوم الديزل',
  'Other Expenses': 'مصاريف أخرى',
  Custody: 'عهدة',
};

export interface ITripActivity extends IAuditFields {
  dateTime: string;
  category: string;
  amount: number;
  transactionType: 'EXPENSE' | 'REVENUE' | 'ADVANCED';
}

type TransactionsTableProps = {
  data?: ITripActivity[];
};

export default function TransactionsTable({ data }: TransactionsTableProps) {
  const getAmountColor = (type: string) => {
    switch (type) {
      case 'EXPENSE':
        return 'text-red-600';
      case 'REVENUE':
        return 'text-green-600';
      case 'ADVANCED':
        return 'text-blue-600';
      case 'CUSTODY':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التاريخ والوقت</TableHead>
          <TableHead>النشاط</TableHead>
          <TableHead>المبلغ</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data?.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.dateTime ? new Date(item.dateTime).toLocaleString() : '-'}</TableCell>
            <TableCell>
              {TripTransactionCategoryLabels[item.category] || item.category || '-'}
            </TableCell>
            <TableCell className={getAmountColor(item.transactionType)}>
              {item.amount !== undefined ? item.amount.toLocaleString() : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
