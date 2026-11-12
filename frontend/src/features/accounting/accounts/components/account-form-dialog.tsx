'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

import { useCreateAccount } from '../api/create';
import { useUpdateAccount } from '../api/update';
import { useSetOpeningBalance } from '../api/set-opening-balance';
import AccountParentTreeSelect from './account-parent-tree-select';
import { AccountType, NormalBalance } from '../enums';

/**
 * Form schema for creating an account.
 *
 * API rules:
 * - Root accounts (no parentAccountId) → type + normalBalance are required.
 * - Child accounts (with parentAccountId) → type and normalBalance are inherited/omitted.
 * - `isLeaf` and `code` are auto-managed by the backend — never sent.
 */
const accountFormSchema = z
  .object({
    name: z.string().min(1, 'مطلوب').max(255),
    parentAccountId: z.number().optional().nullable(),
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CASH']).optional(),
    normalBalance: z.enum(['DEBIT', 'CREDIT']).optional(),
    openingBalance: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    // If no parent → type and normalBalance are required
    if (!data.parentAccountId) {
      if (!data.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'نوع الحساب مطلوب للحسابات الرئيسية',
          path: ['type'],
        });
      }
      if (!data.normalBalance) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'الرصيد الطبيعي مطلوب للحسابات الرئيسية',
          path: ['normalBalance'],
        });
      }
    }
  });

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Table row may include `code` for read-only display while editing. */
  editData?: {
    id: number;
    code?: string;
    isLeaf?: boolean;
    isSystem?: boolean;
  } & Partial<AccountFormData>;
}

export default function AccountFormDialog({
  open,
  onOpenChange,
  editData,
}: AccountFormDialogProps) {
  const t = useTranslations('accounting.accounts');
  const isEditing = !!editData?.id;
  const canEditOpeningBalance = isEditing && editData?.isLeaf === true;

  const [isChildUi, setIsChildUi] = useState(false);

  const { createAccountMutation, isCreateAccountPending } = useCreateAccount();
  const { updateAccountMutation, isUpdateAccountPending } = useUpdateAccount();
  const { setOpeningBalanceMutation, isSetOpeningBalancePending } = useSetOpeningBalance();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: undefined,
      normalBalance: undefined,
      parentAccountId: null,
      openingBalance: undefined,
    },
  });

  // Watch parentAccountId to conditionally show type/normalBalance
  const parentAccountId = useWatch({ control: form.control, name: 'parentAccountId' });
  const isChildAccount = parentAccountId != null && parentAccountId > 0;

  // When a parent is selected, clear type+normalBalance (inherited from parent)
  useEffect(() => {
    if (isChildAccount) {
      form.setValue('type', undefined);
      form.setValue('normalBalance', undefined);
    }
  }, [isChildAccount, form]);

  // Reset form with editData whenever dialog opens or editData changes
  useEffect(() => {
    if (open && editData) {
      form.reset({
        name: editData.name || '',
        type: editData.type || undefined,
        normalBalance: editData.normalBalance || undefined,
        parentAccountId: editData.parentAccountId || null,
        openingBalance:
          editData.openingBalance != null ? Number(editData.openingBalance) : undefined,
      });
      setIsChildUi(!!editData.parentAccountId);
    } else if (open && !editData) {
      form.reset({
        name: '',
        type: undefined,
        normalBalance: undefined,
        parentAccountId: null,
        openingBalance: undefined,
      });
      setIsChildUi(false);
    }
  }, [open, editData, form]);

  useEffect(() => {
    if (!isChildUi && !isEditing) {
      form.setValue('parentAccountId', null);
    }
  }, [isChildUi, isEditing, form]);

  const onSubmitCreate = (values: AccountFormData) => {
    // Build payload: omit normalBalance if child account (backend enforces this)
    const payload: Record<string, unknown> = {
      name: values.name,
    };
    if (values.parentAccountId) {
      payload.parentAccountId = values.parentAccountId;
      if (values.type) payload.type = values.type;
    } else {
      payload.type = values.type;
      payload.normalBalance = values.normalBalance;
    }
    if (values.openingBalance !== undefined && values.openingBalance > 0) {
      payload.openingBalance = values.openingBalance;
    }

    createAccountMutation(payload as any, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  /**
   * Edit sends `name`, then the opening balance (leaf accounts only) when it changed.
   * Full schema would still validate hidden fields and block submit.
   */
  const onSubmitEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editData?.id) return;
    const id = editData.id;
    const name = form.getValues('name')?.trim() ?? '';
    if (!name) {
      form.setError('name', { message: 'مطلوب' });
      return;
    }
    form.clearErrors('name');

    const newOpening = form.getValues('openingBalance') ?? 0;
    const oldOpening = Number(editData.openingBalance ?? 0);
    const openingChanged = canEditOpeningBalance && Math.abs(newOpening - oldOpening) > 0.001;

    const close = () => {
      onOpenChange(false);
      form.reset();
    };

    const saveOpening = () => {
      if (!openingChanged) return close();
      setOpeningBalanceMutation({ id, data: { amount: newOpening } }, { onSuccess: close });
    };

    // System accounts reject PUT /accounts/:id, so only send the name when it changed.
    if (name === (editData.name ?? '').trim()) return saveOpening();
    updateAccountMutation({ id, data: { name } }, { onSuccess: saveOpening });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.title-edit') : t('form.title-create')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={isEditing ? onSubmitEdit : form.handleSubmit(onSubmitCreate)}
            className="space-y-4"
          >
            {isEditing && editData && (
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm space-y-1 text-muted-foreground">
                {editData.code != null && editData.code !== '' && (
                  <p>
                    <span className="font-medium text-foreground">{t('form.code')}: </span>
                    {editData.code}
                  </p>
                )}
                {editData.type != null && (
                  <p>
                    <span className="font-medium text-foreground">{t('form.type')}: </span>
                    {t(`types.${editData.type}`)}
                  </p>
                )}
                {editData.normalBalance != null && (
                  <p>
                    <span className="font-medium text-foreground">
                      {t('form.normal-balance')}:{' '}
                    </span>
                    {t(`balance-types.${editData.normalBalance}`)}
                  </p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly={isEditing && editData?.isSystem === true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <>
                {!isEditing && (
                  <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20 mb-4">
                    <Switch id="is-child-ui" checked={isChildUi} onCheckedChange={setIsChildUi} />
                    <div className="flex flex-col">
                      <Label htmlFor="is-child-ui" className="mt-0 font-medium cursor-pointer">
                        {t('form.is-leaf')}
                      </Label>
                      <span className="text-xs text-muted-foreground mt-1">
                        {isChildUi
                          ? 'يجب تحديد الحساب الرئيسي'
                          : 'فعّل هذا الخيار لتحديد الحساب الرئيسي'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Parent account selector — visible if isChildUi is true */}
                {isChildUi && (
                  <FormField
                    control={form.control}
                    name="parentAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.parent-account')}</FormLabel>
                        <FormControl>
                          <AccountParentTreeSelect
                            value={field.value ?? null}
                            excludeAccountId={editData?.id}
                            onChange={(id, parent) => {
                              field.onChange(id);
                              // When a parent is selected, pre-fill type from parent (read-only)
                              if (id && parent) {
                                form.setValue('type', parent.type);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* type — only shown for root accounts (no parent selected) or CASH override */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('form.type')}
                        {!isChildAccount && <span className="text-destructive mr-1">*</span>}
                      </FormLabel>
                      {isChildAccount ? (
                        <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm min-h-10 flex items-center text-muted-foreground">
                          {field.value ? t(`types.${field.value}`) : '—'}{' '}
                          <span className="mr-2 text-xs">(مورَّث من الحساب الرئيسي)</span>
                        </div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('form.select-type')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(AccountType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {t(`types.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* normalBalance — only for root accounts; inherited for children */}
                {!isChildAccount && (
                  <FormField
                    control={form.control}
                    name="normalBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('form.normal-balance')}
                          <span className="text-destructive mr-1">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('form.select-balance')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(NormalBalance).map((balance) => (
                              <SelectItem key={balance} value={balance}>
                                {t(`balance-types.${balance}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* openingBalance — on create, and on edit for leaf accounts (changeable anytime) */}
            {(!isEditing || canEditOpeningBalance) && (
              <FormField
                control={form.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.opening-balance')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          field.onChange(isNaN(val) ? undefined : val);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('form.opening-balance-note')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreateAccountPending || isUpdateAccountPending || isSetOpeningBalancePending
                }
              >
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
