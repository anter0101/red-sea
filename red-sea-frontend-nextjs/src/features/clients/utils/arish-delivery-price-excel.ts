'use client';

import ExcelJS from 'exceljs';

import type { IBulkDeliveryPriceItem } from '../api/create-bulk-delivery-prices';
import { PackingType, packingTypeLabels } from '../enums/packing-type';
import type { IGovernorate } from '../types/delivery-price';

// Column headers in Arabic matching the Arish template
const COLUMN_HEADERS = {
  rowNumber: 'م',
  governorate: 'المحافظة',
  area: 'المركز',
  [PackingType.LOOSE]: 'السايب',
  [PackingType.SILO10]: 'سليو 10%',
  [PackingType.SILO12]: 'سليو 12%',
  [PackingType.JUMBO_BAG]: 'جامبو باج',
  [PackingType.BAGGED]: 'المعبأ',
  nolonPrice: 'نولون',
};

// Mapping from PackingType to priceTypeId
const PACKING_TYPE_TO_PRICE_TYPE_ID: Record<PackingType, number> = {
  [PackingType.BAGGED]: 1,
  [PackingType.JUMBO_BAG]: 2,
  [PackingType.SILO10]: 3,
  [PackingType.SILO12]: 4,
  [PackingType.LOOSE]: 5,
};

// Packing types in order for columns (matching Arish template order: السايب, سليو 10%, سليو 12%, جامبو باج, المعبأ)
const PACKING_TYPE_ORDER = [
  PackingType.LOOSE,
  PackingType.SILO10,
  PackingType.SILO12,
  PackingType.JUMBO_BAG,
  PackingType.BAGGED,
] as const;

interface ParsedArishRow {
  governorate: string;
  area: string;
  prices: Record<PackingType, number | null>;
  nolonPrice: number | null;
}

interface ParseResult {
  success: boolean;
  data: ParsedArishRow[];
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
 * Parse Excel file and extract Arish delivery price data
 */
export async function parseArishDeliveryPriceExcel(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const data: ParsedArishRow[] = [];
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
    let govCol = 0;
    let areaCol = 0;
    let nolonCol = 0;
    const priceColumns: Record<PackingType, number> = {} as Record<PackingType, number>;

    // Search for header row (look in first 5 rows)
    for (let rowIdx = 1; rowIdx <= 5; rowIdx++) {
      const row = worksheet.getRow(rowIdx);
      for (let colIdx = 1; colIdx <= 20; colIdx++) {
        const cellValue = String(row.getCell(colIdx).value || '').trim();

        // Skip empty or very short values
        if (cellValue.length < 2) {
          continue;
        }

        if (cellValue === COLUMN_HEADERS.governorate || cellValue === 'المحافظة') {
          govCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (cellValue === COLUMN_HEADERS.area || cellValue === 'المركز') {
          areaCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (
          cellValue === COLUMN_HEADERS[PackingType.LOOSE] ||
          cellValue === 'سايب' ||
          cellValue === 'السايب'
        ) {
          priceColumns[PackingType.LOOSE] = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (
          cellValue === COLUMN_HEADERS[PackingType.SILO10] ||
          cellValue === 'سليو 10%' ||
          cellValue === 'سيلو 10%'
        ) {
          priceColumns[PackingType.SILO10] = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (
          cellValue === COLUMN_HEADERS[PackingType.SILO12] ||
          cellValue === 'سليو 12%' ||
          cellValue === 'سيلو 12%'
        ) {
          priceColumns[PackingType.SILO12] = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (cellValue === COLUMN_HEADERS[PackingType.JUMBO_BAG] || cellValue.includes('جامبو')) {
          priceColumns[PackingType.JUMBO_BAG] = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (
          cellValue === COLUMN_HEADERS[PackingType.BAGGED] ||
          cellValue === 'معبأ' ||
          cellValue === 'المعبأ'
        ) {
          priceColumns[PackingType.BAGGED] = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
        if (cellValue === COLUMN_HEADERS.nolonPrice) {
          nolonCol = colIdx;
          if (rowIdx > headerRowIndex) {
            headerRowIndex = rowIdx;
          }
        }
      }
    }

    if (areaCol === 0) {
      return {
        success: false,
        data: [],
        errors: ['لم يتم العثور على عمود المركز في الملف'],
        validFrom,
        validTo,
      };
    }

    // Parse data rows
    let currentGovernorate = '';
    for (let rowIdx = headerRowIndex + 1; rowIdx <= worksheet.rowCount; rowIdx++) {
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
      const prices: Record<PackingType, number | null> = {
        [PackingType.LOOSE]: null,
        [PackingType.SILO10]: null,
        [PackingType.SILO12]: null,
        [PackingType.JUMBO_BAG]: null,
        [PackingType.BAGGED]: null,
      };

      for (const packingType of PACKING_TYPE_ORDER) {
        const colIdx = priceColumns[packingType];
        if (colIdx) {
          const cellValue = row.getCell(colIdx).value;
          const numValue = Number(cellValue);
          if (!isNaN(numValue) && numValue > 0) {
            prices[packingType] = numValue;
          }
        }
      }

      const nolonRaw = nolonCol ? Number(row.getCell(nolonCol).value) : NaN;
      const nolonPrice = !isNaN(nolonRaw) && nolonRaw > 0 ? nolonRaw : null;

      // Only add row if at least one price is present
      const hasAnyPrice = Object.values(prices).some((p) => p !== null);
      if (hasAnyPrice) {
        data.push({
          governorate: currentGovernorate,
          area: areaValue,
          prices,
          nolonPrice,
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
 * Transform parsed rows to bulk API format for Arish
 */
export function transformArishToApiPayload(
  parsedRows: ParsedArishRow[],
  areaLookup: AreaLookup[],
  validFrom: string,
  validTo: string,
): { items: IBulkDeliveryPriceItem[]; unmatchedAreas: string[] } {
  const items: IBulkDeliveryPriceItem[] = [];
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

    // Create items for each price type
    for (const packingType of PACKING_TYPE_ORDER) {
      const price = row.prices[packingType];
      if (price !== null && price > 0) {
        items.push({
          areaId: matchedArea.id,
          priceTypeId: PACKING_TYPE_TO_PRICE_TYPE_ID[packingType],
          basePrice: price,
          additionalFees: 0,
          taxPrice: 0,
          nolonPrice: row.nolonPrice ?? 0,
          validFrom,
          validTo,
          notes: `${packingType} - ${packingTypeLabels[packingType]}`,
        });
      }
    }
  }

  return { items, unmatchedAreas };
}

/**
 * Export Arish delivery prices to Excel
 */
export async function exportArishDeliveryPricesToExcel(
  governorates: IGovernorate[],
  clientName: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('أسعار التوصيل');

  // Set RTL
  worksheet.views = [{ rightToLeft: true }];

  // Add title row
  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `اسعار نولون وصال اسمنت العريش - ${clientName}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };

  // Add headers on row 2
  const headers = [
    COLUMN_HEADERS.rowNumber,
    COLUMN_HEADERS.governorate,
    COLUMN_HEADERS.area,
    COLUMN_HEADERS[PackingType.LOOSE],
    COLUMN_HEADERS[PackingType.SILO10],
    COLUMN_HEADERS[PackingType.SILO12],
    COLUMN_HEADERS[PackingType.JUMBO_BAG],
    COLUMN_HEADERS[PackingType.BAGGED],
    COLUMN_HEADERS.nolonPrice,
  ];

  worksheet.columns = [
    { key: 'rowNumber', width: 5 },
    { key: 'governorate', width: 15 },
    { key: 'area', width: 35 },
    { key: 'loose', width: 12 },
    { key: 'silo10', width: 12 },
    { key: 'silo12', width: 12 },
    { key: 'jumbo', width: 12 },
    { key: 'bagged', width: 12 },
    { key: 'nolonPrice', width: 12 },
  ];

  const headerRow = worksheet.getRow(2);
  headerRow.values = headers;

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
      const pricesByType: Record<string, number | null> = {
        loose: null,
        silo10: null,
        silo12: null,
        jumbo: null,
        bagged: null,
      };

      for (const price of area.deliveryPrices) {
        const typeName = price.priceType.name;
        const totalPrice = Number(price.totalPrice);
        if (typeName === PackingType.LOOSE) {
          pricesByType.loose = totalPrice;
        }
        if (typeName === PackingType.SILO10) {
          pricesByType.silo10 = totalPrice;
        }
        if (typeName === PackingType.SILO12) {
          pricesByType.silo12 = totalPrice;
        }
        if (typeName === PackingType.JUMBO_BAG) {
          pricesByType.jumbo = totalPrice;
        }
        if (typeName === PackingType.BAGGED) {
          pricesByType.bagged = totalPrice;
        }
      }

      worksheet.addRow({
        rowNumber: rowNumber++,
        governorate: gov.name,
        area: area.name,
        ...pricesByType,
        nolonPrice: area.deliveryPrices[0] ? Number(area.deliveryPrices[0].nolonPrice) : null,
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
  link.download = `أسعار_العريش_${clientName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download Arish template pre-filled with all governorates and areas
 */
export async function downloadArishDeliveryPriceTemplate(
  governments: IGovernmentForTemplate[],
  areas: IAreaForTemplate[],
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('نموذج أسعار العريش');

  // Set RTL
  worksheet.views = [{ rightToLeft: true }];

  // Get today's date and a date 30 days from now for default validity
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const formatDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  // Add title row with date placeholders
  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `اسعار نولون وصال اسمنت العريش اعتبارا من ${formatDate(today)} حتى ${formatDate(thirtyDaysLater)} لجميع انحاء جمهورية مصر العربية للطن الواحد`;
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
    { key: 'area', width: 35 },
    { key: 'loose', width: 12 },
    { key: 'silo10', width: 12 },
    { key: 'silo12', width: 12 },
    { key: 'jumbo', width: 12 },
    { key: 'bagged', width: 12 },
    { key: 'nolonPrice', width: 12 },
  ];

  // Add header row with all columns
  const headerRow = worksheet.getRow(2);
  headerRow.values = [
    COLUMN_HEADERS.rowNumber,
    COLUMN_HEADERS.governorate,
    COLUMN_HEADERS.area,
    COLUMN_HEADERS[PackingType.LOOSE],
    COLUMN_HEADERS[PackingType.SILO10],
    COLUMN_HEADERS[PackingType.SILO12],
    COLUMN_HEADERS[PackingType.JUMBO_BAG],
    COLUMN_HEADERS[PackingType.BAGGED],
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
      loose: null,
      silo10: null,
      silo12: null,
      jumbo: null,
      bagged: null,
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
  link.download = 'نموذج_أسعار_العريش.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
