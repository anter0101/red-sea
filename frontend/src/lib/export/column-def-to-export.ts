import type { ColumnDef } from '@tanstack/react-table';

import type { ExportColumnDef } from './types';

function getColumnId<TRow>(col: ColumnDef<TRow>): string | undefined {
  if (col.id) return col.id;
  if ('accessorKey' in col && typeof col.accessorKey === 'string') {
    return col.accessorKey;
  }
  return undefined;
}

export function columnDefsToExport<TRow>(
  columns: ColumnDef<TRow>[],
  excludeIds: string[] = ['select', 'actions'],
): ExportColumnDef<TRow>[] {
  return columns
    .filter((col) => {
      const id = getColumnId(col);
      return id && !excludeIds.includes(id);
    })
    .map((col) => {
      const key = getColumnId(col) as keyof TRow | string;
      const header = typeof col.header === 'string' ? col.header : String(key);
      return { key, header };
    });
}
