'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import InfoSection from '@/components/common/info-section';
import ReusableCard from '@/components/common/reusable-card';
import TableFilters from '@/components/common/table-filters';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import CarTable from '@/features/cars/components/car-table';
import { carDetailTableExportColumns } from '@/features/cars/export-detail.config';
import { useExportRows } from '@/hooks/use-export-rows';

import { usePartnerPage } from '../hooks/use-partner-page';
import { mapPartnerCarsToDetailRows } from '../utils/map-partner-cars';
import type { PartnerApi } from '../types';

interface PartnerPageClientProps {
  partnerId: string;
}

export default function PartnerPageClient({ partnerId }: PartnerPageClientProps) {
  const t = useTranslations('owners');
  const {
    partner,
    isGetPartnerPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeletePartnerPending,
  } = usePartnerPage(Number(partnerId));

  const router = useRouter();

  const handleEdit = () => {
    router.push(`/partners/${partnerId}/update`);
  };

  const tabs = [
    { id: 'cars', label: ' السيارات' },
    { id: 'trips', label: 'الرحلات' },
    { id: 'accounts', label: 'الحسابات' },
  ];

  const partnerCarRows = useMemo(
    () => mapPartnerCarsToDetailRows(partner as PartnerApi | undefined),
    [partner],
  );

  const getPartnerCarExportRows = useCallback(() => partnerCarRows, [partnerCarRows]);

  const { exportData, isExporting } = useExportRows({
    columns: carDetailTableExportColumns(),
    getRows: getPartnerCarExportRows,
    fileName: `partner-${partnerId}-cars`,
    enabled: partnerCarRows.length > 0,
  });

  return (
    <div className="pageContainer flex flex-col gap-6">
      <div className="w-full flex justify-center">
        <EntityToggleTabs tabs={tabs} defaultTab="cars" onChange={setActiveTab} />
      </div>

      {activeTab === 'cars' && (
        <div className="flex flex-col gap-4">
          <InfoSection
            showEdit
            onEdit={handleEdit}
            title="معلومات الشريك"
            items={[
              {
                label: 'اسم الشريك',
                value: partner?.name ?? 'غير متوفر',
              },
              {
                label: 'البريد الإلكتروني',
                value: partner?.email ?? 'غير متوفر',
              },
              {
                label: 'رقم الهاتف',
                value: partner?.phone ?? 'غير متوفر',
              },
              { label: 'العنوان', value: partner?.address ?? 'غير متوفر' },
              {
                label: 'طريقة التحويل',
                value: partner?.transactionType ?? 'غير محدد',
              },
              {
                label: 'رقم التحويل',
                value: partner?.transferNumber ?? 'غير محدد',
              },
              { label: 'ملاحظات', value: partner?.notes ?? '—' },
              {
                label: 'اضيف بواسطة',
                value: partner?.createdBy ?? 'غير معروف',
              },
              // {
              //   label: "تاريخ الانضمام",
              //   value: partner?.createdAt ?? "غير معروف",
              // },
            ]}
          />
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="flex gap-2">
          <ReusableCard
            data={{
              title: ' اجمالى المصروف',
              value: '5,978.35 EGP',
              description: '300EGP/شهر',
            }}
            color="primary"
          />
          <ReusableCard
            data={{
              title: 'اجمالى الارادات',
              value: '5,978.35 EGP',
              description: '300EGP/شهر',
            }}
            color="secondary"
          />
          <ReusableCard
            data={{
              title: ' اجمالى الصافى',
              value: '5,978.35 EGP',
              description: '300EGP/شهر',
            }}
            color="primary"
          />
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: 'استخدام الوقود التقريبي',
                value: '4564 L',
                description: 'إجمالي الوقود المستخدم',
              }}
              color="primary"
            />

            <ReusableCard
              data={{
                title: 'المسافة الإجمالية',
                value: '3,000 km',
                description: 'إجمالي المسافة المقطوعة',
              }}
              color="secondary"
            />

            <ReusableCard
              data={{
                title: 'الوزن المنقول شهرياً',
                value: '36,000 ton',
                description: 'إجمالي الحمولة الشهرية',
              }}
              color="primary"
            />

            <ReusableCard
              data={{
                title: 'نشاط الشاحنة / إجمالي الأيام',
                value: '1.5L/km',
                description: 'معدل الاستهلاك لكل كم',
              }}
              color="secondary"
            />

            <ReusableCard
              data={{
                title: 'نشاط الشاحنة اليومي',
                value: '12km /يوم',
                description: 'متوسط المسافة اليومية',
              }}
              color="primary"
            />

            <ReusableCard
              data={{
                title: 'الوزن المنقول يومياً',
                value: '120 ton /يوم',
                description: 'متوسط الحمولة اليومية',
              }}
              color="secondary"
            />
          </div>
          <EntitiesToolbar onExport={exportData} isExporting={isExporting} />
          <TableFilters />
          <CarTable data={partnerCarRows} />
        </div>
      )}
    </div>
  );
}
