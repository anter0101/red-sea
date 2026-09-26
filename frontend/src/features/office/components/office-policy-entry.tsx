'use client';

import { useState } from 'react';
import { ScanLine } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import PolicyEntryChoice, {
  type PolicyEntryMode,
} from '@/features/policy-wizard/components/policy-entry-choice';
import { useGetOnePolicy } from '@/features/trips/api/get-one/get-one-policy';
import { PolicyForm } from '@/features/trips/components/policy-from';
import { PolicyLedgerReview } from '@/features/trips/components/policy-ledger-review';

export default function OfficePolicyEntry({ journeyId }: { journeyId: number }) {
  const router = useRouter();
  const [entry, setEntry] = useState<PolicyEntryMode | null>(null);
  const { policy } = useGetOnePolicy(journeyId);
  const hasPolicy = Boolean(policy?.id);

  if (!entry) {
    return <PolicyEntryChoice onSelect={setEntry} />;
  }

  if (entry === 'scan') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center" dir="rtl">
        <Button type="button" variant="outline" size="icon" disabled title="رفع الملف لاحقاً عبر OCR">
          <ScanLine className="size-4" />
        </Button>
        <p className="text-sm text-muted-foreground">رفع الملف لاحقاً عبر OCR</p>
        <Button type="button" variant="outline" onClick={() => setEntry(null)}>
          رجوع
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl" dir="rtl">
      <PolicyForm
        journeyId={journeyId}
        mode={hasPolicy ? 'update' : 'create'}
        onSaved={() => router.push('/office/policy')}
      />
      {hasPolicy && <PolicyLedgerReview journeyId={journeyId} />}
    </div>
  );
}
