'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CalendarIcon, FileSpreadsheet, Upload, X } from 'lucide-react';

import { useGetAllAreas } from '@/apis/areas/get-all-areas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/dropzone';

import { useCreateDeliveryPrice } from '../api/create-delivery-price';
import {
  parseWataneyaDeliveryPriceExcel,
  transformWataneyaToApiPayload,
} from '../utils/wataneya-delivery-price-excel';

interface ImportWataneyaDeliveryPricesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export default function ImportWataneyaDeliveryPricesDialog({
  open,
  onOpenChange,
  clientId,
}: ImportWataneyaDeliveryPricesDialogProps) {
  const router = useRouter();
  const t = useTranslations('clients.delivery-prices');
  const tButtons = useTranslations('clients.buttons');

  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{
    rows: number;
    errors: string[];
    unmatchedAreas: string[];
    validFrom: string | null;
    validTo: string | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const { areas } = useGetAllAreas();
  const { createDeliveryPriceMutation, isCreateDeliveryPricePending } = useCreateDeliveryPrice();

  const handleFileDrop = async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const result = await parseWataneyaDeliveryPriceExcel(selectedFile);

      if (!result.success) {
        setParseResult({
          rows: 0,
          errors: result.errors,
          unmatchedAreas: [],
          validFrom: result.validFrom,
          validTo: result.validTo,
        });
      } else {
        // Transform to check for unmatched areas
        const areaLookup =
          areas?.map((area) => ({
            id: area.id,
            name: area.name,
            governorateName: '',
          })) ?? [];

        const { unmatchedAreas } = transformWataneyaToApiPayload(
          result.data,
          areaLookup,
          Number(clientId),
          result.validFrom || '',
          result.validTo || '',
        );

        setParseResult({
          rows: result.data.length,
          errors: result.errors,
          unmatchedAreas: [...new Set(unmatchedAreas)],
          validFrom: result.validFrom,
          validTo: result.validTo,
        });
      }
    } catch {
      setParseResult({
        rows: 0,
        errors: ['حدث خطأ أثناء قراءة الملف'],
        unmatchedAreas: [],
        validFrom: null,
        validTo: null,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!file || !parseResult?.validFrom || !parseResult?.validTo) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await parseWataneyaDeliveryPriceExcel(file);

      if (!result.success) {
        return;
      }

      const areaLookup =
        areas?.map((area) => ({
          id: area.id,
          name: area.name,
          governorateName: '',
        })) ?? [];

      const { items } = transformWataneyaToApiPayload(
        result.data,
        areaLookup,
        Number(clientId),
        result.validFrom || '',
        result.validTo || '',
      );

      if (items.length === 0) {
        setParseResult((prev) => ({
          ...prev!,
          errors: [...(prev?.errors ?? []), 'لا توجد بيانات صالحة للاستيراد'],
        }));
        return;
      }

      // Import items one by one using the single API
      setImportProgress({ current: 0, total: items.length });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setImportProgress({ current: i + 1, total: items.length });

        try {
          await new Promise<void>((resolve) => {
            createDeliveryPriceMutation(item, {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error) => {
                errorCount++;
                console.error(`Error importing item ${i + 1}:`, error);
                resolve(); // Continue with next item even on error
              },
            });
          });
        } catch (err) {
          errorCount++;
          console.error(`Error importing item ${i + 1}:`, err);
        }
      }

      if (successCount > 0) {
        onOpenChange(false);
        resetState();
        router.refresh();
      }

      if (errorCount > 0) {
        setParseResult((prev) => ({
          ...prev!,
          errors: [...(prev?.errors ?? []), `فشل استيراد ${errorCount} من ${items.length} سجل`],
        }));
      }
    } finally {
      setIsProcessing(false);
      setImportProgress(null);
    }
  };

  const resetState = () => {
    setFile(null);
    setParseResult(null);
    setImportProgress(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  // Format date from YYYY-MM-DD to readable format
  const formatDisplayDate = (dateStr: string | null): string => {
    if (!dateStr) {
      return '—';
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const canImport =
    file &&
    parseResult &&
    parseResult.validFrom &&
    parseResult.validTo &&
    parseResult.rows > 0 &&
    parseResult.errors.filter((e) => !e.startsWith('تحذير')).length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t('import.title')} - الوطنية
          </DialogTitle>
          <DialogDescription>{t('import.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            {file ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setParseResult(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Dropzone
                accept={{
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                }}
                maxFiles={1}
                onDrop={handleFileDrop}
                className="h-24"
              >
                <DropzoneEmptyState>
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t('import.drop-file')}</span>
                  </div>
                </DropzoneEmptyState>
              </Dropzone>
            )}
          </div>

          {/* Parse Results */}
          {isProcessing && !importProgress && (
            <div className="text-center text-sm text-muted-foreground">جاري تحليل الملف...</div>
          )}

          {/* Import Progress */}
          {importProgress && (
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                جاري الاستيراد: {importProgress.current} من {importProgress.total}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{
                    width: `${(importProgress.current / importProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {parseResult && !isProcessing && (
            <div className="space-y-2">
              {parseResult.rows > 0 && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  تم العثور على {parseResult.rows} صف من البيانات
                </div>
              )}

              {/* Display parsed dates from Excel */}
              {(parseResult.validFrom || parseResult.validTo) && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-medium">تواريخ الصلاحية من الملف:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-blue-600">من:</span>
                      <div className="font-medium">{formatDisplayDate(parseResult.validFrom)}</div>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600">حتى:</span>
                      <div className="font-medium">{formatDisplayDate(parseResult.validTo)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show warning if dates not found */}
              {(!parseResult.validFrom || !parseResult.validTo) && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  لم يتم العثور على تواريخ الصلاحية في الملف. يرجى التأكد من وجود التواريخ في عنوان
                  الملف بصيغة &quot;من DD/MM/YYYY حتى DD/MM/YYYY&quot;
                </div>
              )}

              {parseResult.errors.length > 0 && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  <ul className="list-inside list-disc">
                    {parseResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parseResult.unmatchedAreas.length > 0 && (
                <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                  <p className="font-medium">المناطق التالية غير موجودة في النظام:</p>
                  <ul className="mt-1 list-inside list-disc">
                    {parseResult.unmatchedAreas.slice(0, 5).map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                    {parseResult.unmatchedAreas.length > 5 && (
                      <li>و {parseResult.unmatchedAreas.length - 5} مناطق أخرى...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {tButtons('cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport || isCreateDeliveryPricePending || isProcessing}
          >
            {isProcessing ? t('saving') : t('import.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
