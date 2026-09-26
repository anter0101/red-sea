'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressCell } from './address';
import { IGpsTail } from '../types/device';

type DeviceTailsTableProps = {
  tails?: IGpsTail[];
};

export default function DeviceTailsTable({ tails }: DeviceTailsTableProps) {
  if (!tails || !tails.length) {
    return <div className="text-center py-6 text-gray-500">لا توجد تحركات للجهاز</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الترتيب</TableHead>
          <TableHead>التاريخ / الوقت</TableHead>
          <TableHead>الإحداثيات</TableHead>
          <TableHead>العنوان</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {tails.map((tail) => (
          <TableRow key={tail.id}>
            <TableCell>{tail.sequenceOrder}</TableCell>
            <TableCell>
              {tail.timestamp ? new Date(tail.timestamp).toLocaleString('ar-EG') : '-'}
            </TableCell>
            <TableCell>
              {tail.latitude && tail.longitude
                ? `${tail.latitude.toFixed(6)}, ${tail.longitude.toFixed(6)}`
                : '-'}
            </TableCell>
            <TableCell>
              <AddressCell lat={tail.latitude} lng={tail.longitude} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
