'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import { PackingType, packingTypeLabels } from '@/features/clients/enums/packing-type';
import redSeaLogo from '../../../../public/assets/icons/red-sea-logo.svg';
import type { InvoiceView } from '../types';
import { formatMoney } from './money';
import { servicesClaimLines } from './services-claim-lines';

type Props = {
  invoice: InvoiceView;
};

export const PrintableServicesClaim = forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  const t = useTranslations('invoices');
  const lines = servicesClaimLines(invoice.journeys);
  const quantityTotal = lines.reduce((sum, row) => sum + row.quantity, 0);
  const amountTotal = lines.reduce((sum, row) => sum + row.value, 0);

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
          <p className="text-2xl font-bold">{invoice.companyName || 'البحر الأحمر'}</p>
          <div className="mt-2 inline-grid grid-cols-[auto_auto] justify-center gap-x-4 gap-y-1 font-bold">
            <span>{t('taxCard')}</span>
            <span>{invoice.taxCard || '—'}</span>
            <span>{t('commercialRegister')}</span>
            <span>{invoice.commercialRegister || '—'}</span>
            <span>{t('date')}</span>
            <span>{formatSheetDate(invoice.date)}</span>
          </div>
          <p className="mt-3 text-lg font-bold">
            {t('servicesClaimNo')} ( {invoice.code || '—'} )
          </p>
        </div>
        <div />
      </header>

      <p className="border border-black px-3 py-2 text-center text-base font-bold">
        {t('servicesClaimTo')} {invoice.clientName || '—'}
      </p>
      <p className="border border-t-0 border-black px-3 py-2 text-center text-sm font-bold">
        {t('servicesClaimSentence')}
      </p>

      <table className="mt-0 w-full border-collapse border border-black text-center text-xs">
        <thead>
          <tr>
            <th className="border border-black px-1 py-2">{t('colIndex')}</th>
            <th className="border border-black px-1 py-2">{t('colParty')}</th>
            <th className="border border-black px-1 py-2">{t('colType')}</th>
            <th className="border border-black px-1 py-2">{t('colQty')}</th>
            <th className="border border-black px-1 py-2">{t('colPrice')}</th>
            <th className="border border-black px-1 py-2">{t('colValue')}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((row, index) => (
            <tr key={`${row.governorate}-${row.packingType}-${row.unitPrice}`}>
              <td className="border border-black px-1 py-2 font-bold">{index + 1}</td>
              <td className="border border-black px-1 py-2">{row.governorate}</td>
              <td className="border border-black px-1 py-2">{packingLabel(row.packingType)}</td>
              <td className="border border-black px-1 py-2">{formatQuantity(row.quantity)}</td>
              <td className="border border-black px-1 py-2">{formatMoney(row.unitPrice)}</td>
              <td className="border border-black px-1 py-2">{formatMoney(row.value)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-black px-1 py-2" colSpan={3}>
              {t('colTotal')}
            </td>
            <td className="border border-black px-1 py-2">{formatQuantity(quantityTotal)}</td>
            <td className="border border-black px-1 py-2" />
            <td className="border border-black px-1 py-2">{formatMoney(amountTotal)}</td>
          </tr>
        </tbody>
      </table>

      <footer className="mt-10 flex items-end justify-between px-6">
        <p className="text-base font-bold">{t('approved')} ,,,,</p>
        <div className="flex h-28 w-44 items-center justify-center rounded-full border-2 border-black text-sm font-bold">
          {t('companyStamp')}
        </div>
      </footer>
    </div>
  );
});

PrintableServicesClaim.displayName = 'PrintableServicesClaim';

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

function formatQuantity(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
