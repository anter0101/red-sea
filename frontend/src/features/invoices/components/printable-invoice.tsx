'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import redSeaLogo from '../../../../public/assets/icons/red-sea-logo.svg';
import type { InvoiceView } from '../types';
import { formatMoney } from './money';

type Props = {
  invoice: InvoiceView;
};

export const PrintableInvoice = forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  const t = useTranslations('invoices');

  return (
    <div ref={ref} dir="rtl" className="bg-white p-6 text-sm text-black">
      <header className="grid grid-cols-3 items-center border-b-2 border-black pb-3">
        <img src={redSeaLogo.src} alt="Red Sea" className="h-14 w-auto justify-self-start" />
        <div className="text-center">
          <p className="text-lg font-bold">فاتورة</p>
          <p className="text-xs">البحر الأحمر</p>
        </div>
        <div />
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2 border border-black">
        <Meta label={t('code')} value={invoice.code || '—'} />
        <Meta label={t('date')} value={invoice.date || '—'} />
        <Meta label={t('tax')} value={invoice.taxEnabled ? t('taxOn') : t('taxOff')} />
      </div>

      <p className="mt-3 border border-black px-3 py-2">
        <span className="text-neutral-600">{t('client')}: </span>
        <span className="font-semibold">{invoice.clientName || '—'}</span>
      </p>

      <table className="mt-4 w-full border-collapse border border-black text-right">
        <thead>
          <tr className="bg-neutral-100">
            <th className="w-12 border border-black px-2 py-1.5 font-semibold">#</th>
            <th className="border border-black px-2 py-1.5 font-semibold">{t('delegate')}</th>
            <th className="w-36 border border-black px-2 py-1.5 font-semibold">{t('revenue')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.journeys.map((row, index) => (
            <tr key={row.journeyId}>
              <td className="border border-black px-2 py-1.5">{index + 1}</td>
              <td className="border border-black px-2 py-1.5">{row.delegateNumber || row.journeyId}</td>
              <td className="border border-black px-2 py-1.5">{formatMoney(row.revenueAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 mr-auto w-full max-w-xs border border-black">
        <TotalRow label={t('total')} value={invoice.totalRevenue} />
        {invoice.taxEnabled && (
          <TotalRow label={`${t('vat')} (${invoice.vatPercentage}%)`} value={invoice.vatAmount} />
        )}
        <TotalRow
          label={`${t('withholding')} (${invoice.withholdingPercentage}%)`}
          value={invoice.withholdingAmount}
        />
        <TotalRow label={t('net')} value={invoice.netAmount} emphasize />
      </div>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-black px-3 py-2 not-last:border-l">
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 border-b border-black px-3 py-1.5 last:border-b-0 ${
        emphasize ? 'bg-neutral-100 font-bold' : ''
      }`}
    >
      <span>{label}</span>
      <span>{formatMoney(value)}</span>
    </div>
  );
}
