import { columnDefsToExport } from '@/lib/export';
import type { ExportColumnDef } from '@/lib/export';
import { columns, type TripRow } from '@/components/main-table/columns';

export function tripsExportColumns(): ExportColumnDef<TripRow>[] {
  return columnDefsToExport(columns);
}

export function mapTripRow(journey: TripRow): TripRow {
  return journey;
}
