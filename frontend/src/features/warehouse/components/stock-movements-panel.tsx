'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import queryClient from '@/lib/query-client';
import { cn } from '@/lib/utils';

import { useGetStockMovements } from '../api/get-stock-movements';
import { ProductConditionLabels, StockMovementType } from '../types/products';
import StockMovementDialog from './stock-movement-dialog';

const typeLabels: Record<StockMovementType, string> = {
  [StockMovementType.IN]: 'توريد',
  [StockMovementType.OUT]: 'صرف',
  [StockMovementType.ADJUST]: 'تعديل',
};

const typeRowClass: Record<StockMovementType, string> = {
  [StockMovementType.IN]: 'bg-emerald-50 hover:bg-emerald-50/80',
  [StockMovementType.OUT]: 'bg-rose-50 hover:bg-rose-50/80',
  [StockMovementType.ADJUST]: 'bg-amber-50 hover:bg-amber-50/80',
};

const typeBadgeClass: Record<StockMovementType, string> = {
  [StockMovementType.IN]: 'bg-emerald-600 hover:bg-emerald-600 text-white',
  [StockMovementType.OUT]: 'bg-rose-600 hover:bg-rose-600 text-white',
  [StockMovementType.ADJUST]: 'bg-amber-600 hover:bg-amber-600 text-white',
};

export default function StockMovementsPanel({ productId }: { productId: number }) {
  const { movements, isPending, refetch } = useGetStockMovements(productId);
  const [dialogType, setDialogType] = useState<StockMovementType.IN | StockMovementType.OUT | null>(
    null,
  );

  const handleSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    queryClient.invalidateQueries({ queryKey: ['api', 'warehouses'] });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 justify-end">
        <Button onClick={() => setDialogType(StockMovementType.IN)}>توريد</Button>
        <Button variant="secondary" onClick={() => setDialogType(StockMovementType.OUT)}>
          صرف
        </Button>
      </div>

      {isPending ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>قبل</TableHead>
                <TableHead>بعد</TableHead>
                <TableHead>الوحدة</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الوزن</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>بواسطة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    لا توجد حركات مخزون بعد
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id} className={cn(typeRowClass[m.type])}>
                    <TableCell>
                      <Badge className={cn(typeBadgeClass[m.type])}>
                        {typeLabels[m.type] ?? m.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell>{m.quantityBefore}</TableCell>
                    <TableCell>{m.quantityAfter}</TableCell>
                    <TableCell>{m.unit ?? '—'}</TableCell>
                    <TableCell>{m.unitPrice ?? '—'}</TableCell>
                    <TableCell>{m.weightNote ?? '—'}</TableCell>
                    <TableCell>
                      {m.condition ? ProductConditionLabels[m.condition] ?? m.condition : '—'}
                    </TableCell>
                    <TableCell>{m.reason ?? '—'}</TableCell>
                    <TableCell>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString('ar-EG') : '—'}
                    </TableCell>
                    <TableCell>{m.createdBy ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {dialogType && (
        <StockMovementDialog
          open={!!dialogType}
          onOpenChange={(open) => !open && setDialogType(null)}
          productId={productId}
          type={dialogType}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
