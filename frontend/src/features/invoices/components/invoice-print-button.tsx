'use client';

import { Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import client from '@/lib/client';
import type { InvoiceView } from '../types';
import { PrintableInvoice } from './printable-invoice';

type Props = {
  invoice: Pick<InvoiceView, 'id' | 'code'>;
};

export function InvoicePrintButton({ invoice }: Props) {
  const t = useTranslations('invoices');
  const printRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState<InvoiceView | null>(null);
  const [pending, setPending] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: full?.code ?? invoice.code,
    pageStyle: '@page { size: A4 landscape; margin: 10mm; }',
  });

  useEffect(() => {
    if (!shouldPrint || !full) return;
    setShouldPrint(false);
    handlePrint();
  }, [shouldPrint, full, handlePrint]);

  const onClick = async () => {
    setPending(true);
    try {
      const data =
        full ?? (await client.get<InvoiceView>(`/api/invoices/${invoice.id}`)).data;
      if (!full) setFull(data);
      setShouldPrint(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title={t('print')}
        aria-label={t('print')}
        disabled={pending}
        onClick={(event) => {
          event.stopPropagation();
          void onClick();
        }}
      >
        {pending ? <Spinner className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
      </Button>
      <div className="hidden">
        {full ? <PrintableInvoice ref={printRef} invoice={full} /> : null}
      </div>
    </>
  );
}
