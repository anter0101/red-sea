'use client';

import { Printer } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { DelegationPrintDialog } from '@/features/delegation-print/components/delegation-print-dialog';
import { useGetDelegationPrintState } from '@/features/delegation-print/api/get-print-state';

type Props = {
  journeyId: number;
};

export function CustodyPrintButton({ journeyId }: Props) {
  const t = useTranslations('custody');
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isDataEntry = session?.user?.role?.toUpperCase() === 'DATA_ENTRY';
  const { printState, isPrintStatePending } = useGetDelegationPrintState(journeyId, {
    enabled: isDataEntry,
  });

  if (!isDataEntry) {
    return null;
  }

  if (isPrintStatePending) {
    return (
      <div className="flex justify-center">
        <Spinner className="h-4 w-4" />
      </div>
    );
  }

  if (!printState?.canPrint) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-primary"
        onClick={() => setOpen(true)}
        aria-label={t('print.delegation')}
      >
        <Printer className="h-4 w-4" />
      </Button>

      <DelegationPrintDialog
        open={open}
        onOpenChange={setOpen}
        journeyId={journeyId}
        markPrintedOnSuccess
      />
    </>
  );
}
