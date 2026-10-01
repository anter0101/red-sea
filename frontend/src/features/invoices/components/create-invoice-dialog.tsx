'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getApiErrorMessage } from '@/lib/api-error';
import client from '@/lib/client';
import type { CreateInvoiceBody, InvoicePreview, InvoiceView } from '../types';
import { formatMoney } from './money';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
  clientName?: string | null;
  journeyIds: number[];
};

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  journeyIds,
}: Props) {
  const t = useTranslations('invoices');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [vatPercentage, setVatPercentage] = useState('14');
  const [withholdingPercentage, setWithholdingPercentage] = useState('3');

  const body: CreateInvoiceBody = {
    clientId,
    journeyIds,
    taxEnabled,
    vatPercentage: Number(vatPercentage || 0),
    withholdingPercentage: Number(withholdingPercentage || 0),
  };

  const preview = useQuery({
    queryKey: ['invoice-preview', body],
    enabled: open && journeyIds.length > 0 && clientId > 0,
    queryFn: async () => {
      const res = await client.post<InvoicePreview>('/api/invoices/preview', body);
      return res.data;
    },
  });

  const issue = useMutation({
    mutationFn: async () => {
      const res = await client.post<InvoiceView>('/api/invoices', body);
      return res.data;
    },
    onSuccess: async (invoice) => {
      toast.success(t('issued'));
      await queryClient.invalidateQueries({ queryKey: ['journeys'] });
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
      router.push(`/invoices/${invoice.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('create')));
    },
  });

  const totals = preview.data?.totals;
  const previewError = preview.error ? getApiErrorMessage(preview.error, '') : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {t('create')}
            {clientName ? ` — ${clientName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 sm:col-span-3">
            <Label htmlFor="invoice-tax">{t('tax')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {taxEnabled ? t('taxOn') : t('taxOff')}
              </span>
              <Switch id="invoice-tax" checked={taxEnabled} onCheckedChange={setTaxEnabled} />
            </div>
          </div>
          <div>
            <Label htmlFor="vat-percentage">{t('vatPercentage')}</Label>
            <Input
              id="vat-percentage"
              className="mt-1"
              inputMode="decimal"
              value={vatPercentage}
              onChange={(event) => setVatPercentage(event.target.value)}
              disabled={!taxEnabled}
            />
          </div>
          <div>
            <Label htmlFor="withholding-percentage">{t('withholdingPercentage')}</Label>
            <Input
              id="withholding-percentage"
              className="mt-1"
              inputMode="decimal"
              value={withholdingPercentage}
              onChange={(event) => setWithholdingPercentage(event.target.value)}
            />
          </div>
        </div>

        {previewError && <p className="text-sm text-amber-700">{previewError}</p>}

        {totals && (
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Total label={t('total')} value={totals.totalRevenue} />
            <Total label={t('vat')} value={totals.vatAmount} />
            <Total label={t('withholding')} value={totals.withholdingAmount} />
            <Total label={t('net')} value={totals.netAmount} />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('lines')}</h3>
          {(preview.data?.lines ?? []).map((line) => (
            <div key={`${line.kind}-${line.entryType}`} className="rounded-lg border p-3 text-sm">
              <div className="font-medium">
                {line.entryType === 'DEBIT' ? t('debit') : t('credit')} — {formatMoney(line.amount)}
              </div>
              <div>{line.path}</div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => issue.mutate()}
            disabled={issue.isPending || preview.isFetching || !preview.data || Boolean(previewError)}
          >
            {t('issue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold">{formatMoney(value)}</div>
    </div>
  );
}
