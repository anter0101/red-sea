'use client';

import ExcelJS from 'exceljs';

import type { IDeliveryPricePayload } from '../api/create-delivery-price';
import type { IGovernorate } from '../types/delivery-price';

// Column headers in Arabic matching the Wataneya template
const COLUMN_HEADERS = {
  rowNumber: 'م',
  governorate: 'المحافظة',
  area: 'منطقة التعبئة',
  basePrice: 'مطالبة (سولار-كارته-موازين-تحصيل)',
  additionalFees: 'نقل بالطن',
  taxPrice: 'ضريبة القيمة المضافة',
  totalPrice: 'الاجمالي',
  nolonPrice: 'نولون',
};

// Shorter column headers for parsing flexibility
const COLUMN_ALIASES = {
  governorate: ['المحافظة', 'محافظة'],
  area: ['منطقة التعبئة', 'المركز', 'المنطقة', 'منطقة'],
  basePrice: ['مطالبة', 'مطالبه', 'سولار'],
  additionalFees: ['نقل بالطن', 'نقل', 'فاتورة'],
  taxPrice: ['ضريبة القيمة المضافة', 'ض ق م', 'ضريبة', 'القيمة المضافة'],
  totalPrice: ['الاجمالي', 'اجمالي', 'الإجمالي'],
  nolonPrice: ['نولون', 'نولون السعر'],
};

interface ParsedWataneyaRow {
  governorate: string;
  area: string;
  basePrice: number | null;
  additionalFees: number | null;
  taxPrice: number | null;
  totalPrice: number | null;
  nolonPrice: number | null;
}

interface ParseResult {
  success: boolean;
  data: ParsedWataneyaRow[];
  errors: string[];
  validFrom: string | null;
  validTo: string | null;
}

interface AreaLookup {
  id: number;
  name: string;
  governorateName: string;
}

// Types for template generation
interface IGovernmentForTemplate {
  id: number;
  name: string;
}

interface IAreaForTemplate {
  id: number;
  name: string;
}

/**
 * Check if cell value matches any of the aliases
 */
function matchesAlias(cellValue: string, aliases: string[]): boolean {
  const normalizedCell = cellValue.trim().toLowerCase();
  // Skip empty or very short cell values
  if (normalizedCell.length < 2) {
    return false;
  }
  return aliases.some(
    (alias) =>
      normalizedCell === alias.toLowerCase() || normalizedCell.includes(alias.toLowerCase()),
  );
}

/**
 * Extract dates from header text
 * Looks for patterns like "من 1/12/2025 حتى 30/12/2025" or "اعتبارا من 1/12/2025 حتى 30/12/2025"
 */
function extractDatesFromHeader(headerText: string): {
  validFrom: string | null;
  validTo: string | null;
} {
  // Pattern to match dates in various formats
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
  const matches = headerText.match(datePattern);

  if (matches && matches.length >= 2) {
    // Convert DD/MM/YYYY to YYYY-MM-DD format for API
    const convertDate = (dateStr: string): string => {
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      return dateStr;
    };

    return {
      validFrom: convertDate(matches[0]),
      validTo: convertDate(matches[1]),
    };
  }

  // Try to find date cells in specific pattern "من:" and "حتى:"
  const fromMatch = headerText.match(/من[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
  const toMatch = headerText.match(/حتى[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);

  const convertDate = (dateStr: string): string => {
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  return {
    validFrom: fromMatch ? convertDate(fromMatch[1]) : null,
    validTo: toMatch ? convertDate(toMatch[1]) : null,
  };
}

/**
 * Parse Excel file and extract Wataneya delivery price data
 */
export async function parseWataneyaDeliveryPriceExcel(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const data: ParsedWataneyaRow[] = [];
  let validFrom: string | null = null;
  let validTo: string | null = null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return {
        success: false,
        data: [],
        errors: ['لا توجد ورقة عمل في الملف'],
        validFrom: null,
        validTo: null,
      };
    }

    // Extract dates from first few rows (title/header area)
    for (let rowIdx = 1; rowIdx <= 3; rowIdx++) {
      const row = worksheet.getRow(rowIdx);
      for (let colIdx = 1; colIdx <= 10; colIdx++) {
        const cellValue = String(row.getCell(colIdx).value || '');
        if (cellValue.includes('من') || cellValue.includes('حتى')) {
          const dates = extractDatesFromHeader(cellValue);
          if (dates.validFrom) {
            validFrom = dates.validFrom;
          }
          if (dates.validTo) {
            validTo = dates.validTo;
          }
        }
      }
    }

    // Find header row and column indices
    let headerRowIndex = 0;
    let dataStartRow = 0;
    let govCol = 0;
    let areaCol = 0;
    let basePriceCol = 0;
    let additionalFeesCol = 0;
    let taxPriceCol = 0;
    let totalPriceCol = 0;
    let nolonPriceCol = 0;

    // Search for header row (look in first 5 rows)
    for (let rowIdx = 1; rowIdx <= 5; rowIdx++) {
      const row = worksheet.getRow(rowIdx);
      for (let colIdx = 1; colIdx <= 20; colIdx++) {
        const cellValue = String(row.getCell(colIdx).value || '').trim();

        if (matchesAlias(cellValue, COLUMN_ALIASES.governorate)) {
          govCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.area)) {
          areaCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.basePrice)) {
          basePriceCol = colIdx;
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.additionalFees)) {
          additionalFeesCol = colIdx;
          // If we find sub-header items in a different row, track the max row
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.taxPrice)) {
          taxPriceCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.totalPrice)) {
          totalPriceCol = colIdx;
        }
        if (matchesAlias(cellValue, COLUMN_ALIASES.nolonPrice)) {
          nolonPriceCol = colIdx;
        }
      }
    }

    // Data starts after the last header row found
    dataStartRow = headerRowIndex + 1;

    if (areaCol === 0) {
      return {
        success: false,
        data: [],
        errors: ['لم يتم العثور على عمود المنطقة في الملف'],
        validFrom,
        validTo,
      };
    }

    if (basePriceCol === 0) {
      return {
        success: false,
        data: [],
        errors: ['لم يتم العثور على عمود المطالبة في الملف'],
        validFrom,
        validTo,
      };
    }

    // Parse data rows
    let currentGovernorate = '';
    for (let rowIdx = dataStartRow; rowIdx <= worksheet.rowCount; rowIdx++) {
      const row = worksheet.getRow(rowIdx);

      // Check for governorate in gov column or area column (merged cells)
      const govValue = String(row.getCell(govCol || 1).value || '').trim();
      const areaValue = String(row.getCell(areaCol).value || '').trim();

      // Update current governorate if found
      if (govValue && govValue !== currentGovernorate) {
        currentGovernorate = govValue;
      }

      // Skip empty rows
      if (!areaValue) {
        continue;
      }

      // Parse prices
      const basePrice = Number(row.getCell(basePriceCol).value);
      const additionalFees = additionalFeesCol
        ? Number(row.getCell(additionalFeesCol).value)
        : null;
      const taxPrice = taxPriceCol ? Number(row.getCell(taxPriceCol).value) : null;
      const totalPrice = totalPriceCol ? Number(row.getCell(totalPriceCol).value) : null;
      const nolonPrice = nolonPriceCol ? Number(row.getCell(nolonPriceCol).value) : null;

      // Only add row if base price is present and valid
      if (!isNaN(basePrice) && basePrice > 0) {
        data.push({
          governorate: currentGovernorate,
          area: areaValue,
          basePrice: basePrice,
          additionalFees: !isNaN(additionalFees!) ? additionalFees : null,
          taxPrice: !isNaN(taxPrice!) ? taxPrice : null,
          totalPrice: !isNaN(totalPrice!) ? totalPrice : null,
          nolonPrice: nolonPrice != null && !isNaN(nolonPrice) ? nolonPrice : null,
        });
      }
    }

    if (data.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['لا توجد بيانات أسعار في الملف'],
        validFrom,
        validTo,
      };
    }

    // Validate dates were found
    if (!validFrom || !validTo) {
      errors.push(
        'تحذير: لم يتم العثور على تواريخ الصلاحية في الملف. يرجى التأكد من وجود التواريخ في العنوان.',
      );
    }

    return { success: true, data, errors, validFrom, validTo };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`خطأ في قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`],
      validFrom: null,
      validTo: null,
    };
  }
}

/**
 * Transform parsed rows to API payload format for Wataneya
 */
export function transformWataneyaToApiPayload(
  parsedRows: ParsedWataneyaRow[],
  areaLookup: AreaLookup[],
  clientId: number,
  validFrom: string,
  validTo: string,
): { items: IDeliveryPricePayload[]; unmatchedAreas: string[] } {
  const items: IDeliveryPricePayload[] = [];
  const unmatchedAreas: string[] = [];

  for (const row of parsedRows) {
    // Try to find matching area
    const matchedArea = areaLookup.find(
      (area) =>
        area.name === row.area || area.name.includes(row.area) || row.area.includes(area.name),
    );

    if (!matchedArea) {
      unmatchedAreas.push(row.area);
      continue;
    }

    if (row.basePrice !== null && row.basePrice > 0) {
      const additionalFees = row.additionalFees ?? 0;
      const taxPrice = row.taxPrice ?? 0;
      const totalPrice = row.totalPrice ?? row.basePrice + additionalFees + taxPrice;

      items.push({
        clientId,
        areaId: matchedArea.id,
        priceTypeId: 1, // Always BAGGED for Wataneya
        basePrice: row.basePrice,
        additionalFees: additionalFees,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
        nolonPrice: row.nolonPrice ?? 0,
        validFrom,
        validTo,
        notes: 'تسعير الوطنية للأسمنت',
      });
    }
  }

  return { items, unmatchedAreas };
}

/**
 * Export Wataneya delivery prices to Excel
 */
export async function exportWataneyaDeliveryPricesToExcel(
  governorates: IGovernorate[],
  clientName: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('أسعار التوصيل');

  // Set RTL
  worksheet.views = [{ rightToLeft: true }];

  // Add title row
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `اسعار نولون وصال اسمنت الوطنية - ${clientName}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };

  // Add headers on row 2
  worksheet.columns = [
    { header: '', key: 'rowNumber', width: 5 },
    { header: '', key: 'governorate', width: 15 },
    { header: '', key: 'area', width: 25 },
    { header: '', key: 'basePrice', width: 20 },
    { header: '', key: 'additionalFees', width: 15 },
    { header: '', key: 'taxPrice', width: 20 },
    { header: '', key: 'totalPrice', width: 12 },
    { header: '', key: 'nolonPrice', width: 12 },
  ];

  // Set header values on row 2
  const headerRow = worksheet.getRow(2);
  headerRow.values = [
    COLUMN_HEADERS.rowNumber,
    COLUMN_HEADERS.governorate,
    COLUMN_HEADERS.area,
    COLUMN_HEADERS.basePrice,
    COLUMN_HEADERS.additionalFees,
    COLUMN_HEADERS.taxPrice,
    COLUMN_HEADERS.totalPrice,
    COLUMN_HEADERS.nolonPrice,
  ];

  // Style header row
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0A800' },
  };
  headerRow.alignment = { horizontal: 'center' };

  // Add data rows starting from row 3
  let rowNumber = 1;
  for (const gov of governorates) {
    for (const area of gov.areas) {
      // Get the first delivery price for this area (Wataneya uses single price per area)
      const price = area.deliveryPrices[0];

      worksheet.addRow({
        rowNumber: rowNumber++,
        governorate: gov.name,
        area: area.name,
        basePrice: price ? Number(price.basePrice) : null,
        additionalFees: price ? Number(price.additionalFees) : null,
        taxPrice: price ? Number(price.taxPrice) : null,
        totalPrice: price ? Number(price.totalPrice) : null,
        nolonPrice: price ? Number(price.nolonPrice) : null,
      });
    }
  }

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `أسعار_الوطنية_${clientName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download Wataneya template pre-filled with all governorates and areas
 */
export async function downloadWataneyaDeliveryPriceTemplate(
  governments: IGovernmentForTemplate[],
  areas: IAreaForTemplate[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('نموذج أسعار الوطنية');

  // Set RTL
  worksheet.views = [{ rightToLeft: true }];

  // Get today's date and a date 30 days from now for default validity
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formatDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  // Add title row with date placeholders
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `اسعار نولون وصال اسمنت الوطنية اعتبارا من ${formatDate(today)} حتى ${formatDate(thirtyDaysLater)} لجميع انحاء جمهورية مصر العربية للطن الواحد معبأ`;
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  titleCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };

  // Set column widths
  worksheet.columns = [
    { key: 'rowNumber', width: 5 },
    { key: 'governorate', width: 15 },
    { key: 'area', width: 25 },
    { key: 'basePrice', width: 20 },
    { key: 'additionalFees', width: 15 },
    { key: 'taxPrice', width: 20 },
    { key: 'totalPrice', width: 12 },
    { key: 'nolonPrice', width: 12 },
  ];

  // Add header row with all columns
  const headerRow = worksheet.getRow(2);
  headerRow.values = [
    COLUMN_HEADERS.rowNumber,
    COLUMN_HEADERS.governorate,
    COLUMN_HEADERS.area,
    COLUMN_HEADERS.basePrice,
    COLUMN_HEADERS.additionalFees,
    COLUMN_HEADERS.taxPrice,
    COLUMN_HEADERS.totalPrice,
    COLUMN_HEADERS.nolonPrice,
  ];

  // Style header row
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0A800' },
  };
  headerRow.alignment = { horizontal: 'center' };

  // Create a hidden sheet for dropdown lists (to avoid 255 char limit in formulas)
  const listsSheet = workbook.addWorksheet('القوائم', {
    state: 'hidden',
  });

  // Add governorate names to column A
  governments.forEach((gov, index) => {
    listsSheet.getCell(index + 1, 1).value = gov.name;
  });

  // Add area names to column B
  areas.forEach((area, index) => {
    listsSheet.getCell(index + 1, 2).value = area.name;
  });

  // Add empty rows with dropdown validation starting from row 3
  // Default to 100 empty rows for user to fill
  const numberOfEmptyRows = 100;
  const dataRowStart = 3;

  for (let i = 0; i < numberOfEmptyRows; i++) {
    worksheet.addRow({
      rowNumber: i + 1,
      governorate: '',
      area: '',
      basePrice: null,
      additionalFees: null,
      taxPrice: null,
      totalPrice: null,
      nolonPrice: null,
    });
  }

  // Add data validation for governorate column (dropdown) using range reference
  if (governments.length > 0) {
    const govRangeEnd = governments.length;

    for (let rowIdx = dataRowStart; rowIdx < dataRowStart + numberOfEmptyRows; rowIdx++) {
      const cell = worksheet.getCell(rowIdx, 2);
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`القوائم!$A$1:$A$${govRangeEnd}`],
      };
    }
  }

  // Add data validation for area column (dropdown) using range reference
  if (areas.length > 0) {
    const areaRangeEnd = areas.length;

    for (let rowIdx = dataRowStart; rowIdx < dataRowStart + numberOfEmptyRows; rowIdx++) {
      const cell = worksheet.getCell(rowIdx, 3);
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`القوائم!$B$1:$B$${areaRangeEnd}`],
      };
    }
  }

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'نموذج_أسعار_الوطنية.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
