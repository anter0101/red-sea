'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, AlertCircle, CheckCircle, CalendarIcon, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import ExportButton from '@/components/common/export-button';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import AccountLeafTreeSelect from '../../accounts/components/account-leaf-tree-select';
import {
  mapTransactionDetailLineRow,
  transactionLinesExportColumns,
} from '../../transaction-lines/export.config';
import { useExportRows } from '@/hooks/use-export-rows';
import { useCreateTransaction } from '../api/create';
import { useUpdateTransaction } from '../api/update';
import { useGetOneTransaction } from '../api/get-one';
import { TransactionStatus } from '../enums';
import { createTransactionSchema, type TransactionFormValues } from '../types';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: number | null;
}

export default function TransactionFormDialog({
  open,
  onOpenChange,
  editId,
}: TransactionFormDialogProps) {
  const t = useTranslations('accounting.transactions');
  const tCommon = useTranslations('accounting.common');
  const tLines = useTranslations('accounting.transaction-lines');
  const { createTransactionMutation, isCreateTransactionPending } = useCreateTransaction();
  const { updateTransactionMutation, isUpdateTransactionPending } = useUpdateTransaction();
  const { transaction, isGetTransactionLoading } = useGetOneTransaction(editId || null);

  const isEditing = !!editId;
  const isFinalizeDraft = Boolean(isEditing && transaction?.status === 'DRAFT');
  const showBlockedEdit = Boolean(
    isEditing && !isGetTransactionLoading && transaction && transaction.status !== 'DRAFT',
  );
  const showEditLoading = Boolean(isEditing && isGetTransactionLoading);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(createTransactionSchema(t)),
    defaultValues: {
      date: '',
      description: '',
      status: 'DRAFT',
      transactionLines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactionLines',
  });

  // Calculate balances dynamically
  const lines = form.watch('transactionLines') || [];
  const totalDebit = lines
    .filter((l) => l.entryType === 'DEBIT')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const totalCredit = lines
    .filter((l) => l.entryType === 'CREDIT')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit === totalCredit && lines.length > 0;
  const statusWatch = form.watch('status');

  const getExportLines = useCallback(() => {
    if (!transaction?.transactionLines?.length) return [];
    return transaction.transactionLines.map((line) =>
      mapTransactionDetailLineRow(line, transaction.code),
    );
  }, [transaction]);

  const { exportData: exportLines, isExporting: isExportingLines } = useExportRows({
    columns: transactionLinesExportColumns(tLines),
    getRows: getExportLines,
    fileName: transaction ? `transaction-${transaction.code}-lines` : 'transaction-lines',
    enabled: isEditing && !!transaction?.transactionLines?.length,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && isEditing && transaction) {
      form.reset({
        date: transaction.date.slice(0, 10),
        description: transaction.description,
        status: transaction.status,
        transactionLines:
          transaction.transactionLines?.map((line) => ({
            accountId: Number(line.account.id),
            entryType: line.entryType,
            amount: Number(line.amount),
            description: line.description || '',
          })) || [],
      });
    } else if (open && !isEditing) {
      form.reset({
        date: '',
        description: '',
        status: 'DRAFT',
        transactionLines: [],
      });
    }
  }, [open, isEditing, transaction, form]);

  const handleSubmit = (values: TransactionFormValues) => {
    if (isFinalizeDraft) {
      if (values.status === 'DRAFT') return;
    } else if (!isBalanced) {
      return;
    }

    if (isEditing && editId) {
      updateTransactionMutation(
        {
          id: editId,
          data: { date: values.date, description: values.description, status: values.status },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    } else {
      createTransactionMutation(values, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount);

  const dialogTitle = showBlockedEdit
    ? t('form.title-edit')
    : isFinalizeDraft
      ? t('form.title-finalize-draft')
      : isEditing
        ? t('form.title-edit')
        : t('form.title-create');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {showEditLoading && (
          <p className="text-center py-10 text-muted-foreground">{t('list.loading')}</p>
        )}

        {showBlockedEdit && (
          <>
            <p className="text-sm text-muted-foreground py-2">{t('form.cannot-edit-non-draft')}</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
            </DialogFooter>
          </>
        )}

        {!showEditLoading && !showBlockedEdit && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
              {isFinalizeDraft && (
                <p className="text-sm text-muted-foreground border-b border-slate-200 pb-4">
                  {t('form.finalize-draft-hint')}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-1">
                        {t('form.date')}
                        {!isFinalizeDraft && <span className="text-red-500 font-bold">*</span>}
                      </FormLabel>
                      {isFinalizeDraft ? (
                        <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm min-h-10 flex items-center">
                          {field.value ? format(new Date(field.value), 'PPP') : '—'}
                        </div>
                      ) : (
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-right font-normal h-10',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value), 'PPP')
                                ) : (
                                  <span>{t('form.select-date')}</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t('form.status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10">
                            <SelectValue placeholder={t('form.select-status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(isFinalizeDraft
                            ? ([TransactionStatus.POSTED, TransactionStatus.CANCELLED] as const)
                            : (Object.values(TransactionStatus) as TransactionStatus[])
                          ).map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`statuses.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2" />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2 border-b pb-6 border-slate-200">
                    <FormLabel className="flex items-center gap-1">
                      {t('form.description')}
                      {!isFinalizeDraft && <span className="text-red-500 font-bold">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-20"
                        readOnly={isFinalizeDraft}
                        disabled={isFinalizeDraft}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Lines Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-slate-700">{t('form.step-3')}</h3>
                  {isEditing && (
                    <ExportButton onExport={exportLines} isExporting={isExportingLines} />
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                  {/* DEBIT TABLE */}
                  <div className="border rounded-md overflow-hidden bg-slate-50/50 flex flex-col shadow-sm">
                    <div className="bg-emerald-50/50 text-emerald-800 p-3 font-semibold text-sm border-b border-emerald-100 flex justify-between items-center">
                      <span>{t('form.debit')} (مدينة)</span>
                      <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                        {fields.filter((f) => f.entryType === 'DEBIT').length} بنود
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/30 border-b">
                          <tr>
                            <th className="text-right p-2 font-medium">{t('form.account')}</th>
                            <th className="text-right p-2 font-medium w-32">المبلغ</th>
                            {!isFinalizeDraft && <th className="p-2 w-10 text-center" />}
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field, index) => {
                            if (field.entryType !== 'DEBIT') return null;
                            return (
                              <tr key={field.id} className="border-b last:border-b-0 bg-white">
                                <td className="p-1.5 align-top">
                                  <FormField
                                    control={form.control}
                                    name={`transactionLines.${index}.accountId`}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        {isFinalizeDraft ? (
                                          <div className="min-h-9 px-2 flex items-center text-sm border rounded-md bg-muted/30">
                                            {transaction?.transactionLines?.[index]?.account.name ??
                                              '—'}
                                          </div>
                                        ) : (
                                          <FormControl>
                                            <AccountLeafTreeSelect
                                              value={
                                                formField.value && formField.value > 0
                                                  ? formField.value
                                                  : null
                                              }
                                              triggerClassName="h-9 bg-white"
                                              onChange={(id) => formField.onChange(id)}
                                            />
                                          </FormControl>
                                        )}
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className="p-1.5 align-top w-32">
                                  <FormField
                                    control={form.control}
                                    name={`transactionLines.${index}.amount`}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="h-9 bg-white"
                                            placeholder="0.00"
                                            disabled={isFinalizeDraft}
                                            value={formField.value || ''}
                                            onChange={(e) =>
                                              formField.onChange(parseFloat(e.target.value) || 0)
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                {!isFinalizeDraft && (
                                  <td className="p-1.5 align-middle text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-red-50"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {fields.filter((f) => f.entryType === 'DEBIT').length === 0 && (
                            <tr>
                              <td
                                colSpan={isFinalizeDraft ? 2 : 3}
                                className="p-6 text-center text-muted-foreground text-sm"
                              >
                                لا توجد بنود مدينة
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!isFinalizeDraft && (
                      <div className="p-2 border-t bg-white">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-slate-600 border border-dashed border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                          onClick={() =>
                            append({
                              accountId: 0 as any,
                              entryType: 'DEBIT',
                              amount: 0,
                              description: '',
                            })
                          }
                        >
                          <Plus className="w-4 h-4 mr-1 ml-1" />
                          إضافة بند مدين
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* CREDIT TABLE */}
                  <div className="border rounded-md overflow-hidden bg-slate-50/50 flex flex-col shadow-sm">
                    <div className="bg-red-50/50 text-red-800 p-3 font-semibold text-sm border-b border-red-100 flex justify-between items-center">
                      <span>{t('form.credit')} (دائنة)</span>
                      <span className="text-xs bg-red-100 px-2 py-0.5 rounded-full">
                        {fields.filter((f) => f.entryType === 'CREDIT').length} بنود
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/30 border-b">
                          <tr>
                            <th className="text-right p-2 font-medium">{t('form.account')}</th>
                            <th className="text-right p-2 font-medium w-32">المبلغ</th>
                            {!isFinalizeDraft && <th className="p-2 w-10 text-center" />}
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field, index) => {
                            if (field.entryType !== 'CREDIT') return null;
                            return (
                              <tr key={field.id} className="border-b last:border-b-0 bg-white">
                                <td className="p-1.5 align-top">
                                  <FormField
                                    control={form.control}
                                    name={`transactionLines.${index}.accountId`}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        {isFinalizeDraft ? (
                                          <div className="min-h-9 px-2 flex items-center text-sm border rounded-md bg-muted/30">
                                            {transaction?.transactionLines?.[index]?.account.name ??
                                              '—'}
                                          </div>
                                        ) : (
                                          <FormControl>
                                            <AccountLeafTreeSelect
                                              value={
                                                formField.value && formField.value > 0
                                                  ? formField.value
                                                  : null
                                              }
                                              triggerClassName="h-9 bg-white"
                                              onChange={(id) => formField.onChange(id)}
                                            />
                                          </FormControl>
                                        )}
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                <td className="p-1.5 align-top w-32">
                                  <FormField
                                    control={form.control}
                                    name={`transactionLines.${index}.amount`}
                                    render={({ field: formField }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="h-9 bg-white"
                                            placeholder="0.00"
                                            disabled={isFinalizeDraft}
                                            value={formField.value || ''}
                                            onChange={(e) =>
                                              formField.onChange(parseFloat(e.target.value) || 0)
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </td>
                                {!isFinalizeDraft && (
                                  <td className="p-1.5 align-middle text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-red-50"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {fields.filter((f) => f.entryType === 'CREDIT').length === 0 && (
                            <tr>
                              <td
                                colSpan={isFinalizeDraft ? 2 : 3}
                                className="p-6 text-center text-muted-foreground text-sm"
                              >
                                لا توجد بنود دائنة
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!isFinalizeDraft && (
                      <div className="p-2 border-t bg-white">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-slate-600 border border-dashed border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                          onClick={() =>
                            append({
                              accountId: 0 as any,
                              entryType: 'CREDIT',
                              amount: 0,
                              description: '',
                            })
                          }
                        >
                          <Plus className="w-4 h-4 mr-1 ml-1" />
                          إضافة بند دائن
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Summary */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-md border text-sm mt-4 ${
                    isBalanced && fields.length > 0
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBalanced && fields.length > 0 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span
                      className={`font-bold ${isBalanced && fields.length > 0 ? 'text-emerald-700' : 'text-red-700'}`}
                    >
                      {isBalanced && fields.length > 0
                        ? t('form.balanced')
                        : t('form.not-balanced')}
                    </span>
                  </div>

                  <div className="flex gap-4 mb-0 mr-auto text-slate-700">
                    <span className="flex gap-2 items-center bg-white px-3 py-1 rounded shadow-sm border">
                      <span>{t('form.total-debit')}:</span>
                      <strong className="text-slate-900">{formatAmount(totalDebit)}</strong>
                    </span>
                    <span className="flex gap-2 items-center bg-white px-3 py-1 rounded shadow-sm border">
                      <span>{t('form.total-credit')}:</span>
                      <strong className="text-slate-900">{formatAmount(totalCredit)}</strong>
                    </span>
                    {!isBalanced && (
                      <span className="flex gap-2 items-center text-red-600 bg-white px-3 py-1 rounded shadow-sm border border-red-200">
                        <span>{t('form.difference')}:</span>
                        <strong className="text-red-700">{formatAmount(difference)}</strong>
                      </span>
                    )}
                  </div>
                </div>
                {!isFinalizeDraft && !isBalanced && fields.length > 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    يجب أن يكون إجمالي بطاقة الخصم متساوياً مع إجمالي بطاقة الائتمان لحفظ المعاملة.
                  </p>
                )}
              </div>

              <DialogFooter className="flex gap-2 pt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isFinalizeDraft
                      ? statusWatch === 'DRAFT' ||
                        isUpdateTransactionPending ||
                        isGetTransactionLoading ||
                        !isBalanced ||
                        fields.length === 0
                      : !isBalanced ||
                        isCreateTransactionPending ||
                        isUpdateTransactionPending ||
                        isGetTransactionLoading ||
                        fields.length === 0
                  }
                >
                  {tCommon('save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
