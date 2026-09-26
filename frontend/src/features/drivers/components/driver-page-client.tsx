'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { useDriverPage } from '@/features/drivers/hooks/use-driver-page';
import { formatSalarySummary } from '@/features/salary/driver-salary-form.utils';
import JourneyList from '@/features/trips/components/journey-list';
import DriverAttachmentsPanel from '@/features/drivers/components/driver-attachments-panel';

export default function DriverPageClient({ driverId }: { driverId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const t = useTranslations('drivers');

  const { driver, isGetDriverLoading, error, activeTab, setActiveTab, handleDelete } =
    useDriverPage(Number(driverId));

  const handleEdit = () => {
    router.push(`/drivers/${driverId}/update`);
  };

  if (isGetDriverLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{t('detail-page.loading-error')}</div>;
  }
  if (!driver) {
    return <div>{t('detail-page.driver-not-found')}</div>;
  }

  const user = driver.user;
  const tabs = [
    { id: 'info', label: t('tabs.info') },
    { id: 'trips', label: t('tabs.trips') },
    { id: 'attachments', label: t('tabs.attachments') },
  ];

  return (
    <div className="pageContainer flex flex-col gap-6">
      <EntityHeader
        name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
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
          title={t('detail-page.driver-info')}
          items={[
            {
              label: t('detail-page.name'),
              value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
            },
            {
              label: t('detail-page.phone'),
              value: user?.contacts?.[0]?.phone ?? t('detail-page.not-available'),
            },
            {
              label: t('detail-page.status-label'),
              value: user?.status ? t(`status.${user.status}`) : '',
            },
            { label: t('detail-page.license-number'), value: driver?.licenseNumber ?? '' },
            {
              label: t('detail-page.license-expiry-date'),
              value: driver?.licenseExpiryDate?.toString() ?? '',
            },
            { label: t('detail-page.code'), value: user?.code ?? '' },
            {
              label: t('detail-page.salary-label'),
              value: formatSalarySummary(
                user?.salary,
                t,
                t('detail-page.not-specified'),
              ),
            },
            ...(driver.currentCarCode
              ? [
                  {
                    label: t('detail-page.current-car'),
                    value: driver.currentCarCode,
                  },
                ]
              : []),
            ...(driver.currentJourneyId
              ? [
                  {
                    label: t('detail-page.current-journey'),
                    value: String(driver.currentJourneyId),
                  },
                ]
              : []),
          ]}
        />
      )}

      {activeTab === 'trips' && (
        <JourneyList scope={{ driverId: Number(driverId) }} showStats />
      )}

      {activeTab === 'attachments' && user?.id != null && (
        <DriverAttachmentsPanel
          userId={user.id}
          driverId={Number(driverId)}
          attachments={user.userAttachments ?? []}
        />
      )}
    </div>
  );
}
