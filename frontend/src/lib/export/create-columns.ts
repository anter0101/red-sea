import type { ExportColumnDef } from './types';

type ColumnInput<TRow> = {
  key: keyof TRow | string;
  header: string;
  format?: (value: unknown, row: TRow) => string | number;
  exclude?: boolean;
};

export function createExportColumns<TRow>(defs: ColumnInput<TRow>[]): ExportColumnDef<TRow>[] {
  return defs;
}
