import { createExportColumns } from '@/lib/export/create-columns';
import type { ExportColumnDef } from '@/lib/export';

import type { IGpsTail } from './types/device';

export interface IGpsTailExportRow {
  sequenceOrder: string | number;
  timestamp: string;
  coordinates: string;
}

export function mapGpsTailRow(tail: IGpsTail): IGpsTailExportRow {
  return {
    sequenceOrder: tail.sequenceOrder ?? '—',
    timestamp: tail.timestamp ? new Date(tail.timestamp).toLocaleString('ar-EG') : '—',
    coordinates:
      tail.latitude != null && tail.longitude != null
        ? `${tail.latitude.toFixed(6)}, ${tail.longitude.toFixed(6)}`
        : '—',
  };
}

export function gpsTailsExportColumns(): ExportColumnDef<IGpsTailExportRow>[] {
  return createExportColumns<IGpsTailExportRow>([
    { key: 'sequenceOrder', header: 'الترتيب' },
    { key: 'timestamp', header: 'التاريخ / الوقت' },
    { key: 'coordinates', header: 'الإحداثيات' },
  ]);
}
