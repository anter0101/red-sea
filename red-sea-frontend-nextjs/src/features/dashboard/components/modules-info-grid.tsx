'use client';

import Link from 'next/link';

import type { DriverAssistantStats } from '@/features/driver-assistants/api/get-assistant-stats';
import type { CarStats } from '@/features/cars/api/get-car-stats';
import type { DriverStats } from '@/features/drivers/api/get-driver-stats';
import type { TrailerStats } from '@/features/trailers/api/get-trailer-stats';

type ModuleCardModel = {
  title: string;
  href: string;
  lines: string[];
};

type ModulesInfoGridProps = {
  driverStats?: DriverStats;
  assistantStats?: DriverAssistantStats;
  carStats?: CarStats;
  trailerStats?: TrailerStats;
  partnersCount: number;
  clientsCount: number;
  branchesCount: number;
  warehouseTotal: number;
  lowStockCount: number;
  suppliersCount: number;
  gpsCount: number;
  custodyActiveCount: number;
  officePendingCount: number;
};

export function ModulesInfoGrid({
  driverStats,
  assistantStats,
  carStats,
  trailerStats,
  partnersCount,
  clientsCount,
  branchesCount,
  warehouseTotal,
  lowStockCount,
  suppliersCount,
  gpsCount,
  custodyActiveCount,
  officePendingCount,
}: ModulesInfoGridProps) {
  const cards: ModuleCardModel[] = [
    {
      title: 'السائقون',
      href: '/drivers',
      lines: [
        `الإجمالي: ${driverStats?.total ?? 0}`,
        `على الطريق: ${driverStats?.onRoad ?? 0}`,
        `متاح: ${driverStats?.available ?? 0}`,
      ],
    },
    {
      title: 'التباعون',
      href: '/driver-assistants',
      lines: [
        `الإجمالي: ${assistantStats?.total ?? 0}`,
        `على الطريق: ${assistantStats?.onRoad ?? 0}`,
        `متاح: ${assistantStats?.available ?? 0}`,
      ],
    },
    {
      title: 'السيارات',
      href: '/cars',
      lines: [
        `على الطريق: ${carStats?.onRoad ?? 0}`,
        `شركة: ${carStats?.company ?? 0}`,
        `حصة: ${carStats?.share ?? 0}`,
      ],
    },
    {
      title: 'المقطورات',
      href: '/trailers',
      lines: [
        `على الطريق: ${trailerStats?.onRoad ?? 0}`,
        `شركة: ${trailerStats?.company ?? 0}`,
        `حصة: ${trailerStats?.share ?? 0}`,
        `ناولون: ${trailerStats?.nolon ?? 0}`,
      ],
    },
    {
      title: 'الشركاء',
      href: '/partners',
      lines: [`العدد: ${partnersCount}`],
    },
    {
      title: 'العملاء',
      href: '/clients',
      lines: [`العدد: ${clientsCount}`],
    },
    {
      title: 'فروع الشركة',
      href: '/branches',
      lines: [`العدد: ${branchesCount}`],
    },
    {
      title: 'المخزن',
      href: '/warehouse',
      lines: [`أصناف: ${warehouseTotal}`, `مخزون منخفض: ${lowStockCount}`],
    },
    {
      title: 'الموردون',
      href: '/suppliers',
      lines: [`العدد: ${suppliersCount}`],
    },
    {
      title: 'الخريطة / GPS',
      href: '/gps',
      lines: [`أجهزة: ${gpsCount}`],
    },
    {
      title: 'العُهد',
      href: '/custody',
      lines: [`نشطة: ${custodyActiveCount}`],
    },
    {
      title: 'طلبات المكتب',
      href: '/office-requests',
      lines: [`معلقة: ${officePendingCount}`],
    },
    {
      title: 'الحسابات',
      href: '/accounting/accounts',
      lines: ['حسابات · معاملات · تقارير'],
    },
  ];

  return (
    <section className="space-y-3" dir="rtl">
      <h2 className="text-lg font-semibold text-foreground">وحدات النظام</h2>
      <p className="text-sm text-muted-foreground">لمحة سريعة من كل وحدة</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href + card.title}
            href={card.href}
            className="rounded-lg border border-border bg-background p-4 hover:border-foreground/20 hover:bg-muted/30 transition-colors"
          >
            <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {card.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
}
