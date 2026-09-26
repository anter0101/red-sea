import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IPartnerTableRow } from './api/get-all';

export function partnersExportColumns(
  headers: (key: string) => string,
): ExportColumnDef<IPartnerTableRow>[] {
  return createExportColumns<IPartnerTableRow>([
    { key: 'name', header: headers('name') },
    { key: 'bankAccountNumber', header: headers('bank-account') },
    { key: 'bankName', header: headers('bank-name') },
    { key: 'address', header: headers('address') },
    { key: 'addedBy', header: headers('added-by') },
    { key: 'joinDate', header: headers('join-date') },
  ]);
}

export { mapPartnerRow } from './api/get-all';
