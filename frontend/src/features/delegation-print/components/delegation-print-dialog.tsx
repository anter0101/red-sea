'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useGetOneTrip } from '@/features/trips/api/get-one/get-one';
import { PrintableCard } from '@/features/trips/components/printable-card';
import type { ITripResponse } from '@/features/trips/types/journey';

import { useMarkDelegationPrinted } from '../api/mark-printed';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  journeyId: number;
  markPrintedOnSuccess?: boolean;
};

export function DelegationPrintDialog({
  open,
  onOpenChange,
  journeyId,
  markPrintedOnSuccess = false,
}: Props) {
  const t = useTranslations('custody');
  const printRef = useRef<HTMLDivElement>(null);
  const { tripResponse, isGetTripPending } = useGetOneTrip(journeyId, open);
  const { markPrintedMutation, isMarkPrintedPending } = useMarkDelegationPrinted();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Journey-${journeyId}`,
    onAfterPrint: () => {
      if (!markPrintedOnSuccess) return;
      void markPrintedMutation(journeyId).then(() => onOpenChange(false));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="w-full text-center">{t('print.delegation')}</DialogTitle>
        </DialogHeader>

        {isGetTripPending ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : tripResponse ? (
          <>
            <PrintableCard ref={printRef} data={tripResponse as ITripResponse} />

            <div className="flex items-center justify-center">
              <Button onClick={handlePrint} disabled={isMarkPrintedPending}>
                {isMarkPrintedPending && <Spinner className="mr-2" />}
                {t('print.delegation')}
              </Button>
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-muted-foreground">{t('loading')}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
