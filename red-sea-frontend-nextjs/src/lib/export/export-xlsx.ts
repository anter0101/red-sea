'use client';

import ExcelJS from 'exceljs';

import { buildExportFilename } from './build-filename';
import type { ExportColumnDef } from './types';

function getCellValue<TRow>(row: TRow, key: keyof TRow | string): unknown {
  return (row as Record<string, unknown>)[key as string];
}

export async function exportRowsToXlsx<TRow>({
  columns,
  rows,
  fileName,
  sheetName = 'Data',
}: {
  columns: ExportColumnDef<TRow>[];
  rows: TRow[];
  fileName: string;
  sheetName?: string;
}): Promise<void> {
  const visibleColumns = columns.filter((col) => !col.exclude);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: true }],
  });

  sheet.columns = visibleColumns.map((col) => ({
    header: col.header,
    key: String(col.key),
    width: Math.max(col.header.length + 4, 14),
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' },
  };

  for (const row of rows) {
    const values: Record<string, string | number> = {};
    for (const col of visibleColumns) {
      const raw = getCellValue(row, col.key);
      const formatted = col.format ? col.format(raw, row) : raw;
      values[String(col.key)] =
        formatted === null || formatted === undefined ? '' : (formatted as string | number);
    }
    sheet.addRow(values);
  }

  sheet.columns.forEach((column) => {
    if (!column || typeof column.eachCell !== 'function') return;
    let maxLength = column.header ? String(column.header).length : 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(Math.max(maxLength + 2, 12), 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildExportFilename(fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
