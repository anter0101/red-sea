'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { exportRowsToXlsx, fetchAllPaginated } from '@/lib/export';
import type { ExportColumnDef } from '@/lib/export';

type UseTableExportOptions<TApi, TRow, TParams extends Record<string, unknown>> = {
  endPoint: string;
  params?: TParams;
  columns: ExportColumnDef<TRow>[];
  mapRow: (item: TApi) => TRow;
  fileName: string;
  enabled?: boolean;
  maxRows?: number;
  sheetName?: string;
  parseResponse?: (
    data: unknown,
    headers: Record<string, string | number | undefined>,
  ) => { items: TApi[]; totalCount: number };
};

export function useTableExport<TApi, TRow, TParams extends Record<string, unknown> = Record<string, unknown>>({
  endPoint,
  params,
  columns,
  mapRow,
  fileName,
  enabled = true,
  maxRows,
  sheetName,
  parseResponse,
}: UseTableExportOptions<TApi, TRow, TParams>) {
  const t = useTranslations('common.export');
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async () => {
    if (!enabled) return;

    setIsExporting(true);
    try {
      const { data } = await fetchAllPaginated<TApi, TParams>({
        endPoint,
        params,
        maxRows,
        parseResponse,
      });

      const rows = data.map(mapRow);

      if (rows.length === 0) {
        toast.warning(t('empty'));
        return;
      }

      await exportRowsToXlsx({ columns, rows, fileName, sheetName });
      toast.success(t('success'));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('EXPORT_MAX_ROWS_EXCEEDED:')) {
        const limit = message.split(':')[1];
        toast.error(t('max-rows', { limit }));
      } else {
        toast.error(t('error'));
      }
    } finally {
      setIsExporting(false);
    }
  }, [columns, enabled, endPoint, fileName, mapRow, maxRows, params, parseResponse, sheetName, t]);

  return { exportData, isExporting };
}
