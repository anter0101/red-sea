'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { useDriverAssistantPage } from '@/features/driver-assistants/hooks/use-driver-assistant-page';
import { formatSalarySummary } from '@/features/salary/driver-salary-form.utils';
import JourneyList from '@/features/trips/components/journey-list';

export default function DriverAssistantPageClient({ assistantId }: { assistantId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const t = useTranslations('driverAssistants');

  const { assistant, isGetAssistantLoading, error, activeTab, setActiveTab, handleDelete } =
    useDriverAssistantPage(Number(assistantId));

  const handleEdit = () => {
    router.push(`/driver-assistants/${assistantId}/update`);
  };

  if (isGetAssistantLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{t('detail-page.loading-error')}</div>;
  }
  if (!assistant) {
    return <div>{t('detail-page.assistant-not-found')}</div>;
  }

  const tabs = [
    { id: 'info', label: t('tabs.info') },
    { id: 'trips', label: t('tabs.trips') },
  ];

  return (
    <div className="pageContainer flex flex-col gap-6">
      <EntityHeader
        name={`${assistant?.firstName ?? ''} ${assistant?.lastName ?? ''}`}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      <div className="w-full flex justify-center">
        <EntityToggleTabs
          tabs={tabs}
          value={activeTab}
          defaultTab="info"
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'info' && (
        <InfoSection
          showEdit
          onEdit={handleEdit}
          title={t('detail-page.assistant-info')}
          items={[
            {
              label: t('detail-page.name'),
              value: `${assistant?.firstName ?? ''} ${assistant?.lastName ?? ''}`,
            },
            {
              label: t('detail-page.phone'),
              value: assistant?.contacts?.[0]?.phone ?? t('detail-page.not-available'),
            },
            {
              label: t('detail-page.status-label'),
              value: assistant?.status ? t(`status.${assistant.status}`) : '',
            },
            { label: t('detail-page.code'), value: assistant?.code ?? '' },
            {
              label: t('detail-page.salary-label'),
              value: formatSalarySummary(
                assistant?.salary,
                t,
                t('detail-page.not-specified'),
              ),
            },
          ]}
        />
      )}

      {activeTab === 'trips' && (
        <JourneyList scope={{ driverAssistantId: Number(assistantId) }} showStats />
      )}
    </div>
  );
}
