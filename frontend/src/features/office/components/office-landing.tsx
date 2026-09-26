'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

export default function OfficeLanding() {
  const t = useTranslations('office');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" dir="rtl">
      <ChoiceCard title={t('landing.issueDelegation')} href="/office/issue" />
      <ChoiceCard title={t('landing.registerPolicy')} href="/office/policy" />
    </div>
  );
}
