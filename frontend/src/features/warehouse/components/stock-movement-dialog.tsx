'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

import { useCreateStockMovement } from '../api/create-stock-movement';
import { useGetOneProduct } from '../api/get-one';
import {
  ProductCondition,
  ProductConditionLabels,
  StockMovementType,
} from '../types/products';

const schema = z.object({
  quantity: z.coerce.number().int().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unit: z.string().optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  weightNote: z.string().optional(),
  condition: z.enum(['NEW', 'USED', 'DAMAGED', 'EXPIRED', 'REFURBISHED']).optional(),
  manufacturingYear: z.coerce.number().int().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type StockMovementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  type: StockMovementType.IN | StockMovementType.OUT;
  onSuccess?: () => void;
};

export default function StockMovementDialog({
  open,
  onOpenChange,
  productId,
  type,
  onSuccess,
}: StockMovementDialogProps) {
  const { createStockMovement, isCreateStockMovementPending } = useCreateStockMovement(productId);
  const { ProductInfo } = useGetOneProduct(productId, open);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      quantity: 1,
      unit: '',
      unitPrice: 0,
      weightNote: '',
      reason: '',
      notes: '',
      purchaseDate: '',
      expiryDate: '',
    },
  });

  useEffect(() => {
    if (!open || !ProductInfo) return;
    form.reset({
      quantity: 1,
      unit: ProductInfo.unit ?? '',
      unitPrice: ProductInfo.unitPrice ?? 0,
      weightNote: '',
      condition: ProductInfo.condition,
      manufacturingYear: ProductInfo.manufacturingYear,
      purchaseDate: ProductInfo.purchaseDate
        ? String(ProductInfo.purchaseDate).slice(0, 10)
        : '',
      expiryDate: ProductInfo.expiryDate ? String(ProductInfo.expiryDate).slice(0, 10) : '',
      reason: '',
      notes: '',
    });
  }, [open, ProductInfo, form]);

  const title = type === StockMovementType.IN ? 'توريد مخزون' : 'صرف مخزون';
  const unitLabel = form.watch('unit') || ProductInfo?.unit;
  const quantityLabel = unitLabel ? `الكمية (${unitLabel})` : 'الكمية';

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await createStockMovement({
        type,
        quantity: values.quantity,
        unit: values.unit || undefined,
        unitPrice: values.unitPrice,
        weightNote: values.weightNote || undefined,
        condition: values.condition as ProductCondition | undefined,
        manufacturingYear: values.manufacturingYear || undefined,
        purchaseDate: values.purchaseDate || undefined,
        expiryDate: values.expiryDate || undefined,
        reason: values.reason || undefined,
        notes: values.notes || undefined,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? e?.message ?? 'تعذر تنفيذ الحركة'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{quantityLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوحدة</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الوحدة</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weightNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوزن (ملاحظة)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 2.5 طن" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة المنتج</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختياري" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ProductCondition).map((c) => (
                        <SelectItem key={c} value={c}>
                          {ProductConditionLabels[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturingYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سنة التصنيع</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الشراء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الانتهاء</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السبب</FormLabel>
                  <FormControl>
                    <Input placeholder="اختياري" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Input placeholder="اختياري" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreateStockMovementPending}>
                {isCreateStockMovementPending && <Spinner className="mr-2" />}
                تأكيد
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
