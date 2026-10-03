'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import { PackingType, packingTypeLabels } from '@/features/clients/enums/packing-type';
import redSeaLogo from '../../../../public/assets/icons/red-sea-logo.svg';
import type { InvoiceView } from '../types';
import { formatMoney } from './money';

type CompanyHeader = {
  name: string;
  taxCard: string;
  commercialRegister: string;
};

type Props = {
  invoice: InvoiceView;
  company?: CompanyHeader | null;
};

export const PrintableInvoice = forwardRef<HTMLDivElement, Props>(({ invoice, company }, ref) => {
  const t = useTranslations('invoices');
  const quantityTotal = invoice.journeys.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
  const amountTotal = invoice.journeys.reduce((sum, row) => sum + Number(row.revenueAmount ?? 0), 0);
  const vatAmount = Number(invoice.vatAmount ?? 0);
  const withholdingAmount = Number(invoice.withholdingAmount ?? 0);
  const hasTaxes = vatAmount > 0 || withholdingAmount > 0;

  return (
    <div
      ref={ref}
      dir="rtl"
      className="bg-white p-6 text-sm text-black"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      <header className="mb-4 grid grid-cols-3 items-center">
        <img src={redSeaLogo.src} alt="Red Sea" className="h-16 w-auto justify-self-start" />
        <div className="text-center">
          <p className="text-2xl font-bold">{invoice.companyName || company?.name || 'البحر الأحمر'}</p>
          <div className="mt-2 inline-grid grid-cols-[auto_auto] justify-center gap-x-4 gap-y-1 font-bold">
            <span>{t('taxCard')}</span>
            <span>{invoice.taxCard || company?.taxCard || '—'}</span>
            <span>{t('commercialRegister')}</span>
            <span>{invoice.commercialRegister || company?.commercialRegister || '—'}</span>
            <span>{t('date')}</span>
            <span>{formatSheetDate(invoice.date)}</span>
          </div>
          <p className="mt-3 text-lg font-bold">
            {t('invoiceNo')} : - ({invoice.code || '—'})
          </p>
        </div>
        <div />
      </header>

      <p className="border border-black px-3 py-2 text-center text-base font-bold">
        {t('billTo')} {'<<'} {invoice.clientName || '—'} {'>>'}
      </p>

      <table className="mt-0 w-full border-collapse border border-black text-center text-xs">
        <thead>
          <tr>
            <th className="border border-black px-1 py-2">{t('colIndex')}</th>
            <th className="border border-black px-1 py-2">{t('colDate')}</th>
            <th className="border border-black px-1 py-2">{t('colGov')}</th>
            <th className="border border-black px-1 py-2">{t('colReceived')}</th>
            <th className="border border-black px-1 py-2">{t('colType')}</th>
            <th className="border border-black px-1 py-2">{t('colDestination')}</th>
            <th className="border border-black px-1 py-2">{t('colPrice')}</th>
            <th className="border border-black px-1 py-2">{t('colQty')}</th>
            <th className="border border-black px-1 py-2">{t('colTotal')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.journeys.map((row, index) => (
            <tr key={row.journeyId}>
              <td className="border border-black px-1 py-2 font-bold">{index + 1}</td>
              <td className="border border-black px-1 py-2">{formatSheetDate(row.journeyDate)}</td>
              <td className="border border-black px-1 py-2">{row.governorate || '—'}</td>
              <td className="border border-black px-1 py-2">{row.receivedCompany || '—'}</td>
              <td className="border border-black px-1 py-2">{packingLabel(row.packingType)}</td>
              <td className="border border-black px-1 py-2">{row.destination || '—'}</td>
              <td className="border border-black px-1 py-2">{formatMoney(row.unitPrice)}</td>
              <td className="border border-black px-1 py-2">{formatQuantity(row.quantity)}</td>
              <td className="border border-black px-1 py-2">{formatMoney(row.revenueAmount)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-black px-1 py-2" colSpan={6}>
              {t('colTotal')}
            </td>
            <td className="border border-black px-1 py-2" />
            <td className="border border-black px-1 py-2">{formatQuantity(quantityTotal)}</td>
            <td className="border border-black px-1 py-2">{formatMoney(amountTotal)}</td>
          </tr>
        </tbody>
      </table>
      {hasTaxes ? (
        <section className="mr-auto mt-4 w-96 border-2 border-black text-xs">
          <h2 className="border-b-2 border-black px-3 py-1.5 text-center text-sm font-bold">{t('taxes')}</h2>
          {vatAmount > 0 ? (
            <TaxRow
              label={`${t('vat')} ${formatPercent(invoice.vatPercentage)}`}
              amount={formatMoney(vatAmount)}
              sign="+"
            />
          ) : null}
          {withholdingAmount > 0 ? (
            <TaxRow
              label={`${t('withholding')} ${formatPercent(invoice.withholdingPercentage)}`}
              amount={formatMoney(withholdingAmount)}
              sign="−"
            />
          ) : null}
          <div className="flex items-center justify-between border-t-2 border-black px-3 py-2 text-sm font-bold">
            <span>{t('net')}</span>
            <span>{formatMoney(invoice.netAmount)}</span>
          </div>
        </section>
      ) : null}
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

function TaxRow({ label, amount, sign }: { label: string; amount: string; sign: '+' | '−' }) {
  return (
    <div className="flex items-center justify-between border-b border-black px-3 py-2">
      <span>{label}</span>
      <span dir="ltr" className="font-bold tabular-nums">
        {sign} {amount}
      </span>
    </div>
  );
}

function packingLabel(value: string | null): string {
  if (!value) return '—';
  return packingTypeLabels[value as PackingType] ?? value;
}

function formatSheetDate(value: string | null | undefined): string {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${Number(day)}/${Number(month)}/${year}`;
}

function formatPercent(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '0%';
  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${text}%`;
}

function formatQuantity(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
