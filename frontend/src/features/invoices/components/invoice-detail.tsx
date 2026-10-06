'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { useGetInvoice } from '../api/get-one';
import { formatMoney } from './money';
import { PrintableInvoice } from './printable-invoice';
import { ServicesClaimPrintButton } from './services-claim-print-button';

export default function InvoiceDetail({ id }: { id: number }) {
  const t = useTranslations('invoices');
  const printRef = useRef<HTMLDivElement>(null);
  const { data, isPending, isError } = useGetInvoice(id);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data?.code ?? `invoice-${id}`,
    pageStyle: '@page { size: A4 landscape; margin: 10mm; }',
  });

  if (isPending) return <p className="p-4 text-center">جاري التحميل...</p>;
  if (isError || !data) return <p className="p-4 text-center">{t('empty')}</p>;

  return (
    <div className="pageContainer mx-auto max-w-6xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {t('detail')} {data.code}
        </h1>
        <div className="flex items-center gap-2">
          <ServicesClaimPrintButton invoice={data} />
          <Button type="button" onClick={() => handlePrint()}>
            {t('print')}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label={t('client')} value={data.clientName || '—'} />
        <Stat label={t('date')} value={data.date} />
        <Stat label={t('total')} value={formatMoney(data.totalRevenue)} />
        <Stat label={t('net')} value={formatMoney(data.netAmount)} />
      </div>
      <PrintableInvoice ref={printRef} invoice={data} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
