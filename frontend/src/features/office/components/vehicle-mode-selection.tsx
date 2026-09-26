'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

export default function VehicleModeSelection() {
  const t = useTranslations('office');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3" dir="rtl">
      <ChoiceCard title={t('modes.nolon')} href="/office/nolon-car" />
      <ChoiceCard title={t('modes.contract')} href="/office/contract-car" />
      <ChoiceCard title={t('modes.company')} href="/office/company-car" />
    </div>
  );
}
