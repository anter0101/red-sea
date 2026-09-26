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
import { PackingType, packingTypeLabels } from '../enums/packing-type';
import type { IDeliveryPriceTableRow, IGovernorate } from '../types/delivery-price';

type ArishDeliveryPricesTableProps = {
  clientId: string;
};

// Transform API data to table rows
function transformToTableRows(governorates: IGovernorate[]): IDeliveryPriceTableRow[] {
  const rows: IDeliveryPriceTableRow[] = [];

  for (const governorate of governorates) {
    for (const area of governorate.areas) {
      const prices: Record<PackingType, IDeliveryPriceTableRow['prices'][PackingType]> = {
        [PackingType.BAGGED]: null,
        [PackingType.JUMBO_BAG]: null,
        [PackingType.SILO10]: null,
        [PackingType.SILO12]: null,
        [PackingType.LOOSE]: null,
      };

      for (const price of area.deliveryPrices) {
        const packingType = price.priceType.name as PackingType;
        if (packingType in prices) {
          prices[packingType] = price;
        }
      }

      rows.push({
        areaId: area.id,
        governorateName: governorate.name,
        areaName: area.name,
        prices,
      });
    }
  }

  return rows;
}

export default function ArishDeliveryPricesTable({ clientId }: ArishDeliveryPricesTableProps) {
  const { governorates, isGetDeliveryPricesPending } = useGetDeliveryPrices(clientId);

  const tableRows = useMemo(() => transformToTableRows(governorates), [governorates]);

  const packingTypes = Object.values(PackingType);

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
            <TableHead className="text-right">المحافظة</TableHead>
            <TableHead className="text-right">منطقة التفريغ</TableHead>
            {packingTypes.map((type) => (
              <TableHead key={type} className="text-right">
                {packingTypeLabels[type]}
              </TableHead>
            ))}
            <TableHead className="text-right">نولون</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3 + packingTypes.length}
                className="text-center py-8 text-gray-500"
              >
                لا توجد بيانات
              </TableCell>
            </TableRow>
          ) : (
            tableRows.map((row) => (
              <TableRow key={row.areaId}>
                <TableCell className="font-medium">{row.governorateName}</TableCell>
                <TableCell>{row.areaName}</TableCell>
                {packingTypes.map((type) => (
                  <TableCell key={type}>
                    {row.prices[type] ? row.prices[type]?.totalPrice : '—'}
                  </TableCell>
                ))}
                <TableCell>
                  {Object.values(row.prices).find((p) => p)?.nolonPrice ?? '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
