'use client';

import { useTranslations } from 'next-intl';

import { useGetOneCustody } from '../api/get-one';

const fullName = (u?: { firstName?: string; lastName?: string }) =>
  u && (u.firstName || u.lastName) ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';

const formatPlate = (vehicle?: { plateNumber?: string; plateLetters?: string }) => {
  if (!vehicle?.plateNumber) return '—';
  return vehicle.plateLetters
    ? `${vehicle.plateNumber} ${vehicle.plateLetters}`.trim()
    : vehicle.plateNumber;
};

export default function CustodyDetail({ custodyId }: { custodyId: number }) {
  const t = useTranslations('custody');
  const { custody, isGetCustodyLoading } = useGetOneCustody(custodyId);

  if (isGetCustodyLoading) return <p className="p-4">{t('loading')}</p>;
  if (!custody) return <p className="p-4">{t('table.noData')}</p>;

  const driver = custody.driver ?? custody.journey?.driver;

  const rows: { label: string; value: string }[] = [
    { label: t('form.employee'), value: fullName(custody.employee?.user) },
    { label: t('form.account'), value: custody.account?.name ?? '—' },
    {
      label: t('table.custodyAmount'),
      value: custody.custodyAmount != null ? `${custody.custodyAmount} EGP` : '—',
    },
    { label: t('form.journey'), value: custody.journey?.delegateNumber ?? '—' },
    { label: t('form.driver'), value: fullName(driver?.user) },
    { label: t('table.driverLicense'), value: driver?.licenseNumber ?? '—' },
    { label: t('table.driverAssistant'), value: fullName(custody.journey?.driverAssistant) },
    { label: t('table.car'), value: formatPlate(custody.journey?.car) },
    { label: t('table.trailer'), value: formatPlate(custody.journey?.trailer) },
    { label: t('form.status'), value: t(`statuses.${custody.status}`) },
    {
      label: t('table.createdAt'),
      value: custody.createdAt ? new Date(custody.createdAt).toLocaleDateString('en-GB') : '—',
    },
  ];

  return (
    <div className="max-w-xl space-y-2" dir="rtl">
      <h1 className="titleStyle mb-4">{t('title')}</h1>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
