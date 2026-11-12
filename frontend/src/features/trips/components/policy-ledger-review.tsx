'use client';

import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';

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
};

export function PolicyLedgerReview({ journeyId }: { journeyId: number }) {
  const preview = useQuery({
    queryKey: ['policy-ledger', journeyId],
    queryFn: async () => {
      const res = await client.get<LedgerPreview>(
        `/api/journey-policies/journey/${journeyId}/ledger`,
      );
      return res.data;
    },
  });

  return (
    <section className="mt-8 space-y-4 rounded-xl border border-border p-4">
      <h2 className="text-lg font-semibold">القيود المرحّلة مع البوليصة</h2>

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
    </section>
  );
}
