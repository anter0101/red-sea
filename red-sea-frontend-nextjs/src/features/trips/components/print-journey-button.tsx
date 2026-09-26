'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PrintDialog } from './print-dialog';

export function PrintJourneyButton({ journeyId }: { journeyId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>طباعة</Button>

      <PrintDialog open={open} onOpenChange={setOpen} journeyId={journeyId} />
    </>
  );
}
