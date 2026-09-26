'use client';

import Link from 'next/link';

type AttentionQueueProps = {
  officePendingCount: number;
  lowStockCount: number;
};

export function AttentionQueue({ officePendingCount, lowStockCount }: AttentionQueueProps) {
  const items = [
    {
      href: '/office-requests',
      title: 'طلبات مكتب معلقة',
      count: officePendingCount,
      show: officePendingCount > 0,
    },
    {
      href: '/warehouse',
      title: 'أصناف بمخزون منخفض',
      count: lowStockCount,
      show: lowStockCount > 0,
    },
  ].filter((i) => i.show);

  return (
    <section className="space-y-3" dir="rtl">
      <h2 className="text-lg font-semibold text-foreground">يحتاج متابعة</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد تنبيهات حالياً</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm hover:bg-amber-50 transition-colors"
              >
                <span className="font-medium text-foreground">{item.title}</span>
                <span className="tabular-nums font-semibold text-amber-800">{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
