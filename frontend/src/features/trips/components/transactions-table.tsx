import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { JourneyFinancialActivity } from '../api/get-one/get-financial-activity';

export const TripTransactionCategoryLabels: Record<string, string> = {
  'Diesel Fees': 'سولار',
  'Card Fees': 'كارته',
  'Weighing Fees': 'ميزان',
  'Tips Fees': 'اكراميات',
  Custody: 'عهدة',
  'Nolon Fees': 'نولون',
  'Driver Commission': 'عمولة السائق',
  'Assistant Commission': 'عمولة التابع',
  'Driver Daily Work': 'يومية السائق',
  'Assistant Daily Work': 'يومية التابع',
  'Driver Employee Nolon': 'نولون السائق',
  'Assistant Employee Nolon': 'نولون التابع',
};

type TransactionsTableProps = {
  data?: JourneyFinancialActivity[];
};

const formatAmount = (value: number) =>
  Number(value).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionsTable({ data }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التاريخ</TableHead>
          <TableHead>رقم القيد</TableHead>
          <TableHead>الحساب</TableHead>
          <TableHead>البيان</TableHead>
          <TableHead>مدين</TableHead>
          <TableHead>دائن</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {!data?.length ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              لا توجد حركات مالية لهذه الرحلة
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '-'}</TableCell>
              <TableCell>{item.code || '-'}</TableCell>
              <TableCell>
                {item.accountName ? `${item.accountCode} - ${item.accountName}` : '-'}
              </TableCell>
              <TableCell>{item.description || '-'}</TableCell>
              <TableCell className="text-red-600">
                {item.entryType === 'DEBIT' ? formatAmount(item.amount) : ''}
              </TableCell>
              <TableCell className="text-green-600">
                {item.entryType === 'CREDIT' ? formatAmount(item.amount) : ''}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
