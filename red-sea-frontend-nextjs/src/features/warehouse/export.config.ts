import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IWarehouseTableRow } from './api/get-all';

export function warehouseExportColumns(): ExportColumnDef<IWarehouseTableRow>[] {
  return createExportColumns<IWarehouseTableRow>([
    { key: 'productCode', header: 'كود المنتج' },
    { key: 'name', header: 'اسم المنتج' },
    { key: 'category', header: 'الفئة' },
    { key: 'status', header: 'الحالة' },
    { key: 'condition', header: 'حالة الاستخدام' },
    { key: 'unit', header: 'الوحدة' },
    { key: 'quantity', header: 'العدد' },
    { key: 'alertQuantity', header: 'عدد التنبيه' },
    { key: 'supplierName', header: 'المورد' },
    { key: 'unitPrice', header: 'سعر الوحدة' },
    { key: 'purchaseDate', header: 'تاريخ الشراء' },
    { key: 'expiryDate', header: 'تاريخ الصلاحية' },
    { key: 'createdAt', header: 'تاريخ التسجيل' },
    { key: 'lastUsedDate', header: 'آخر تاريخ صرف' },
  ]);
}

export { mapWarehouseRow } from './api/get-all';
