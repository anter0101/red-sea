'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import client from '@/lib/client';
import { getApiErrorMessage } from '@/lib/api-error';

interface LedgerLine {
  kind: string;
  amount: number;
  debitPath: string;
  creditPath: string;
  alreadyPosted: boolean;
}

interface LedgerPreview {
  policyId: number;
  journeyId: number;
  lines: LedgerLine[];
  warnings: string[];
}

const KIND_LABEL: Record<string, string> = {
  TRN1: 'TRN1 إيراد',
  TRN2: 'TRN2 مصروف نولون / عقد',
  TRN3_OFFICE: 'TRN3 عهدة المكتب',
  TRN3_CUSTODY_SUPPLIER: 'TRN3 مورد العهدة',
};

export function PolicyLedgerReview({ journeyId }: { journeyId: number }) {
  const [transportSupplierId, setTransportSupplierId] = useState('');
  const [custodySupplierId, setCustodySupplierId] = useState('');
  const [custodySupplierAmount, setCustodySupplierAmount] = useState('');

  const suppliers = useQuery({
    queryKey: ['ledger-suppliers'],
    queryFn: async () => {
      const res = await client.get('/api/suppliers', { params: { page: 1, pageSize: 100 } });
      const rows = res.data?.data ?? res.data ?? [];
      return Array.isArray(rows) ? rows : [];
    },
  });

  const params = {
    transportSupplierId: transportSupplierId ? Number(transportSupplierId) : undefined,
    custodySupplierId: custodySupplierId ? Number(custodySupplierId) : undefined,
    custodySupplierAmount: custodySupplierAmount ? Number(custodySupplierAmount) : undefined,
  };

  const preview = useQuery({
    queryKey: ['policy-ledger', journeyId, params],
    queryFn: async () => {
      const res = await client.get<LedgerPreview>(`/api/journey-policies/journey/${journeyId}/ledger`, {
        params,
      });
      return res.data;
    },
  });

  const apply = useMutation({
    mutationFn: async () => {
      const res = await client.post<LedgerPreview>(
        `/api/journey-policies/journey/${journeyId}/ledger/apply`,
        params,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('تم تطبيق القيود');
      void preview.refetch();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'تعذر تطبيق القيود'));
    },
  });

  const transport = (suppliers.data ?? []).filter(
    (row: { type?: string }) => row.type === 'TRANSPORTATION',
  );
  const custody = (suppliers.data ?? []).filter((row: { type?: string }) => row.type === 'CUSTODY');

  return (
    <section className="mt-8 space-y-4 rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">مراجعة القيود</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label>مورد النقل</Label>
          <select
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            value={transportSupplierId}
            onChange={(event) => setTransportSupplierId(event.target.value)}
          >
            <option value="">—</option>
            {transport.map((row: { id: number; name: string }) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>مورد العهدة</Label>
          <select
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            value={custodySupplierId}
            onChange={(event) => setCustodySupplierId(event.target.value)}
          >
            <option value="">—</option>
            {custody.map((row: { id: number; name: string }) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>مبلغ مورد العهدة</Label>
          <Input
            className="mt-1"
            value={custodySupplierAmount}
            onChange={(event) => setCustodySupplierAmount(event.target.value)}
          />
        </div>
      </div>

      {preview.data?.warnings?.map((warning) => (
        <p key={warning} className="text-sm text-amber-700">
          {warning}
        </p>
      ))}

      <div className="space-y-3">
        {(preview.data?.lines ?? []).map((line) => (
          <div key={line.kind} className="rounded-lg border p-3 text-sm">
            <div className="font-medium">
              {KIND_LABEL[line.kind] ?? line.kind} — {line.amount}
              {line.alreadyPosted ? ' (مُرحّل)' : ''}
            </div>
            <div>مدين: {line.debitPath}</div>
            <div>دائن: {line.creditPath}</div>
          </div>
        ))}
        {preview.isSuccess && preview.data.lines.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد قيود للمبلغ الحالي.</p>
        )}
      </div>

      <Button type="button" onClick={() => apply.mutate()} disabled={apply.isPending}>
        تطبيق
      </Button>
    </section>
  );
}
