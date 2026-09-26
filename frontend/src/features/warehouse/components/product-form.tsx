'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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

import { useGetOneProduct } from '../api/get-one';
import { useCreateProduct } from '../api/create';
import { useEditProduct } from '../api/update';

import { useGetAllSuppliers } from '@/features/suppliers/api/get-all';
import { ProductFormValues, ProductSchema } from '../types/product-schema';
import {
  ProductCondition,
  ProductPayload,
  ProductResponse,
  ProductStatus,
} from '../types/products';

interface ProductFromProps {
  productId?: number;
}

const DEFAULT_FORM_VALUES: ProductFormValues = {
  name: '',

  status: 'AVAILABLE',
  condition: 'NEW',

  category: '',

  quantity: 0,
  alertQuantity: 0,

  unit: '',
  supplierId: '',

  unitPrice: 0,
  manufacturingYear: 1990,

  purchaseDate: '',
  expiryDate: '',
};

const mapProductToForm = (product: ProductResponse): ProductFormValues => ({
  name: product.name,
  status: product.status,
  condition: product.condition,
  category: product.category,
  quantity: product.quantity,
  alertQuantity: product.alertQuantity,
  unit: product.unit,
  supplierId: product.supplier?.id ? String(product.supplier.id) : '',
  unitPrice: product.unitPrice,
  manufacturingYear: product.manufacturingYear,
  purchaseDate: product.purchaseDate,
  expiryDate: product.expiryDate,
});

const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.NEW]: 'جديد',
  [ProductStatus.AVAILABLE]: 'متاح',
  [ProductStatus.OUT_OF_STOCK]: 'نفذ من المخزون',
  [ProductStatus.PENDING]: 'قيد الانتظار',
  [ProductStatus.RESERVED]: 'محجوز',
  [ProductStatus.DISCONTINUED]: 'تم إيقاف المنتج',
};

const ProductConditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: 'جديد',
  [ProductCondition.USED]: 'مستعمل',
  [ProductCondition.DAMAGED]: 'تالف',
  [ProductCondition.EXPIRED]: 'منتهي الصلاحية',
  [ProductCondition.REFURBISHED]: 'تم تجديده',
};

export default function ProductForm({ productId }: ProductFromProps) {
  const router = useRouter();
  const isEditMode = productId !== undefined;

  const { suppliers } = useGetAllSuppliers();

  const { createProductMutation, isCreateProductPending } = useCreateProduct();
  const { editProductMutation, isEditProductLoading } = useEditProduct(productId);

  const { ProductInfo, isGetProductLoading } = useGetOneProduct(productId ?? null, isEditMode);

  const isSubmitting = isEditMode ? isEditProductLoading : isCreateProductPending;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as Resolver<ProductFormValues>,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (isEditMode && ProductInfo) {
      form.reset(mapProductToForm(ProductInfo));
    }

    if (!isEditMode) {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [isEditMode, ProductInfo, form]);

  const onSubmit = async (data: ProductFormValues) => {
    const base = {
      name: data.name,
      status: ProductStatus[data.status as keyof typeof ProductStatus],
      condition: ProductCondition[data.condition as keyof typeof ProductCondition],
      category: data.category,
      alertQuantity: data.alertQuantity,
      unit: data.unit,
      supplierId: Number(data.supplierId),
      unitPrice: data.unitPrice,
      manufacturingYear: data.manufacturingYear,
      purchaseDate: data.purchaseDate,
      expiryDate: data.expiryDate,
    };

    try {
      if (isEditMode) {
        // Stock quantity only changes via توريد/صرف movements — not on product update
        await editProductMutation({ data: base as ProductPayload });
        form.reset(DEFAULT_FORM_VALUES);
        router.push(`/warehouse/${productId}`);
      } else {
        const created = await new Promise<ProductResponse>((resolve, reject) => {
          createProductMutation(
            { ...base, quantity: data.quantity },
            {
              onSuccess: (res) => resolve(res),
              onError: (err) => reject(err),
            },
          );
        });
        form.reset(DEFAULT_FORM_VALUES);
        router.push(`/warehouse/${created.id}`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  if (isEditMode && isGetProductLoading) {
    return <div className="p-4">Loading trip data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* اسم المنتج */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ادخل اسم المنتج" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الحالة */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحالة</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {Object.values(ProductStatus).map((status) => (
                      <SelectItem key={status} value={status} className="w-full">
                        {ProductStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الحالة العامة للمنتج */}
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>حالة المنتج</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر حالة المنتج" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {Object.values(ProductCondition).map((cond) => (
                      <SelectItem key={cond} value={cond} className="w-full">
                        {ProductConditionLabels[cond]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الفئة */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفئة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ادخل الفئة" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الكمية — إنشاء فقط؛ التعديل عبر حركات المخزون */}
        {!isEditMode && (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الكمية الابتدائية</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* تنبيه الكمية */}
        <FormField
          control={form.control}
          name="alertQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تنبيه الكمية</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الوحدة */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوحدة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ادخل الوحدة" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* المورد */}
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المورد</FormLabel>
              <FormControl>
                <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {suppliers?.map((sup) => (
                      <SelectItem key={sup.id} value={String(sup.id)} className="w-full">
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* سعر الوحدة */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>سعر الوحدة</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* سنة التصنيع */}
        <FormField
          control={form.control}
          name="manufacturingYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>سنة التصنيع</FormLabel>
              <FormControl>
                <Input type="number" {...field} min={1900} max={new Date().getFullYear()} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* تاريخ الشراء */}
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

        {/* تاريخ الانتهاء */}
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

        {/* زر الحفظ */}
        <Button type="submit" disabled={isSubmitting}>
          {isEditMode ? 'تحديث المنتج' : 'إنشاء المنتج'}
        </Button>
      </form>
    </Form>
  );
}
