'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { exportRowsToXlsx } from '@/lib/export';
import type { ExportColumnDef } from '@/lib/export';

type UseExportRowsOptions<TRow> = {
  columns: ExportColumnDef<TRow>[];
  getRows: () => TRow[] | Promise<TRow[]>;
  fileName: string;
  sheetName?: string;
  enabled?: boolean;
};

export function useExportRows<TRow>({
  columns,
  getRows,
  fileName,
  sheetName,
  enabled = true,
}: UseExportRowsOptions<TRow>) {
  const t = useTranslations('common.export');
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async () => {
    if (!enabled) return;

    setIsExporting(true);
    try {
      const rows = await getRows();

      if (rows.length === 0) {
        toast.warning(t('empty'));
        return;
      }

      await exportRowsToXlsx({ columns, rows, fileName, sheetName });
      toast.success(t('success'));
    } catch {
      toast.error(t('error'));
    } finally {
      setIsExporting(false);
    }
  }, [columns, enabled, fileName, getRows, sheetName, t]);

  return { exportData, isExporting };
}
