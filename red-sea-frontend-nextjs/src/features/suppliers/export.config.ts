import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import { SupplierType } from './enums/supplier-type';
import type { ISupplierTableRow } from './api/get-all';

export function suppliersExportColumns(
  headers: (key: string) => string,
  typeLabel: (type: SupplierType) => string,
): ExportColumnDef<ISupplierTableRow>[] {
  return createExportColumns<ISupplierTableRow>([
    { key: 'code', header: headers('code') },
    { key: 'name', header: headers('name') },
    {
      key: 'type',
      header: headers('type'),
      format: (value) => {
        const type = value as SupplierType | undefined;
        return type ? typeLabel(type) : String(value ?? '');
      },
    },
    { key: 'governorate', header: headers('governorate') },
    { key: 'phone', header: headers('phone') },
  ]);
}

export { mapSupplierRow } from './api/get-all';
