'use client';

import { useMemo } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useGetDeliveryPrices } from '../api/get-delivery-prices';
import type { IGovernorate } from '../types/delivery-price';

type WataneyaDeliveryPricesTableProps = {
  clientId: string;
};

interface IWataneyaTableRow {
  areaId: number;
  governorateName: string;
  areaName: string;
  basePrice: string;
  additionalFees: string;
  taxPrice: string;
  totalPrice: string;
  nolonPrice: string;
}

function transformToTableRows(governorates: IGovernorate[]): IWataneyaTableRow[] {
  const rows: IWataneyaTableRow[] = [];

  for (const governorate of governorates) {
    for (const area of governorate.areas) {
      const price = area.deliveryPrices[0];

      rows.push({
        areaId: area.id,
        governorateName: governorate.name,
        areaName: area.name,
        basePrice: price?.basePrice ?? '—',
        additionalFees: price?.additionalFees ?? '—',
        taxPrice: price?.taxPrice ?? '—',
        totalPrice: price?.totalPrice ?? '—',
        nolonPrice: price?.nolonPrice ?? '—',
      });
    }
  }

  return rows;
}

export default function WataneyaDeliveryPricesTable({
  clientId,
}: WataneyaDeliveryPricesTableProps) {
  const { governorates, isGetDeliveryPricesPending } = useGetDeliveryPrices(clientId);

  const tableRows = useMemo(() => transformToTableRows(governorates), [governorates]);

  if (isGetDeliveryPricesPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المحافظة</TableHead>
            <TableHead>منطقة التفريغ</TableHead>
            <TableHead>مطالبة</TableHead>
            <TableHead>نقل بالطن</TableHead>
            <TableHead>ض ق م</TableHead>
            <TableHead>اجمالي</TableHead>
            <TableHead>نولون</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                لا توجد بيانات
              </TableCell>
            </TableRow>
          ) : (
            tableRows.map((row) => (
              <TableRow key={row.areaId}>
                <TableCell className="font-medium">{row.governorateName}</TableCell>
                <TableCell>{row.areaName}</TableCell>
                <TableCell>{row.basePrice}</TableCell>
                <TableCell>{row.additionalFees}</TableCell>
                <TableCell>{row.taxPrice}</TableCell>
                <TableCell>{row.totalPrice}</TableCell>
                <TableCell>{row.nolonPrice}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
