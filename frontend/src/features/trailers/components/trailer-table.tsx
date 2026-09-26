import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Trailer = {
  id: string;
  carCode: string;
  carType: string;
  model: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  color: string;
  maxLoad: string;
  ownershipType: string;
  partnersCount: string;
  driverName: string;
  trailerNumber: string;
  carStatus: string;
  addedBy: string;
};

type TrailerTableProps = {
  data?: Trailer[];
};

export default function TrailerTable({ data }: TrailerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>كود السيارة</TableHead>
          <TableHead>رقم السيارة</TableHead>
          <TableHead>نوع السيارة</TableHead>
          <TableHead>موديل السيارة</TableHead>
          <TableHead>رقم الرخصة</TableHead>
          <TableHead>تاريخ انتهاء الرخصة</TableHead>
          <TableHead>لون السيارة</TableHead>
          <TableHead>أقصى حمولة</TableHead>
          <TableHead>نوع الملكية</TableHead>
          <TableHead>عدد الشركاء</TableHead>
          <TableHead>السائق الحالي</TableHead>
          <TableHead>رقم المقطورة</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>أضيف بواسطة</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data?.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.carCode}</TableCell>

            <TableCell>
              <Link href={`/cars/${item.id}`} className="text-blue-600 hover:underline">
                {item.trailerNumber}
              </Link>
            </TableCell>

            <TableCell>{item.carType}</TableCell>
            <TableCell>{item.model}</TableCell>
            <TableCell>{item.licenseNumber}</TableCell>
            <TableCell>{item.licenseExpiryDate}</TableCell>
            <TableCell>{item.color}</TableCell>
            <TableCell>{item.maxLoad}</TableCell>
            <TableCell>{item.ownershipType}</TableCell>
            <TableCell>{item.partnersCount}</TableCell>
            <TableCell>{item.driverName}</TableCell>
            <TableCell>{item.trailerNumber}</TableCell>

            <TableCell>
              <Badge className="capitalize px-4 py-1">{item.carStatus}</Badge>
            </TableCell>

            <TableCell>{item.addedBy}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
