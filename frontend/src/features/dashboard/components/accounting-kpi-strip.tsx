'use client';

import Link from 'next/link';

import ReusableCard from '@/components/common/reusable-card';
import type { AccountingDashboard } from '@/features/dashboard/api/get-accounting-dashboard';
import { formatMoney } from '@/features/invoices/components/money';

type AccountingKpiStripProps = {
  totals?: AccountingDashboard;
  isLoading?: boolean;
};

const INCOME_HREF = '/accounting/transaction-lines';
const ACCOUNTS_HREF = '/accounting/accounts';

export function AccountingKpiStrip({ totals, isLoading }: AccountingKpiStripProps) {
  const dash = isLoading ? '…' : undefined;
  const money = (value?: number) => dash ?? formatMoney(value);

  const tiles = [
    { href: INCOME_HREF, title: 'إيرادات الفترة', value: money(totals?.revenue), color: 'success' as const },
    { href: INCOME_HREF, title: 'تكلفة الفترة', value: money(totals?.cost), color: 'secondary' as const },
    { href: INCOME_HREF, title: 'صافي الربح', value: money(totals?.netProfit), color: 'primary' as const },
    { href: ACCOUNTS_HREF, title: 'مستحق على العملاء', value: money(totals?.clients), color: 'blue' as const },
    { href: ACCOUNTS_HREF, title: 'مستحق للموردين', value: money(totals?.suppliers), color: 'primary' as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5" dir="rtl">
      {tiles.map((tile) => (
        <Link key={tile.title} href={tile.href} className="min-w-0 block">
          <ReusableCard data={{ title: tile.title, value: tile.value }} color={tile.color} />
        </Link>
      ))}
    </div>
  );
}
