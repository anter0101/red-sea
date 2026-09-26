'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import EntityToggleTabs from '@/components/common/toggle-tabs';

import GeneralLedgerTab from './reports/general-ledger-tab';
import TrialBalanceTab from './reports/trial-balance-tab';
import IncomeStatementTab from './reports/income-statement-tab';
import BalanceSheetTab from './reports/balance-sheet-tab';

export default function TransactionLinesPageClient() {
  const t = useTranslations('accounting.reports');
  const [activeTab, setActiveTab] = useState('ledger');

  const tabs = [
    { id: 'balance-sheet', label: t('tabs.balance-sheet') },
    { id: 'income-statement', label: t('tabs.income-statement') },
    { id: 'trial', label: t('tabs.trial-balance') },
    { id: 'ledger', label: t('tabs.general-ledger') },
  ];

  return (
    <main>
      <div className="pageContainer flex flex-col gap-6">
        <div className="w-full">
          <div className="flex justify-center mb-6">
            <EntityToggleTabs
              tabs={tabs}
              defaultTab="ledger"
              onChange={(id) => setActiveTab(id)}
              containerClassName="flex-row-reverse"
            />
          </div>

          <div className="mt-0">
            {activeTab === 'ledger' && <GeneralLedgerTab />}
            {activeTab === 'trial' && <TrialBalanceTab />}
            {activeTab === 'income-statement' && <IncomeStatementTab />}
            {activeTab === 'balance-sheet' && <BalanceSheetTab />}
          </div>
        </div>
      </div>
    </main>
  );
}
