'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

/** Admin entry: pick the vehicle mode, then fill the journey and policy in one form. */
export default function FullPolicyModeSelection() {
  const t = useTranslations('office');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3" dir="rtl">
      <ChoiceCard title={t('modes.nolon')} href="/office/full/nolon-car" />
      <ChoiceCard title={t('modes.contract')} href="/office/full/contract-car" />
      <ChoiceCard title={t('modes.company')} href="/office/full/company-car" />
    </div>
  );
}
