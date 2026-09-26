'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { translateVehicleColor } from '@/data/vehicle-colors';
import { OwnerShipTypes } from '@/enums/ownership';
import MaintenancePanel from '@/features/maintenance/components/maintenance-panel';
import { PhysicalAttachmentsPanel } from '@/features/physical-attachments';
import JourneyList from '@/features/trips/components/journey-list';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { formatPlateLettersForDisplay } from '@/lib/plate-letters';

import { useTrailerPage } from '../hooks/use-trailer-page';

export default function TrailerPageClient({ trailerId }: { trailerId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const t = useTranslations('trailers');
  const tAttachments = useTranslations('physicalAttachments');
  const tColors = useTranslations('common.vehicle-colors');
  const { trailer, isGetTrailerLoading, error, activeTab, setActiveTab, handleDelete } =
    useTrailerPage(Number(trailerId));

  const handleEdit = (step?: string) => {
    router.push(`/trailers/${trailerId}/update${step ? `?step=${step}` : ''}`);
  };

  const ownershipLabel = useCallback(
    (key?: string | null) => {
      if (!key) return EMPTY_DISPLAY;
      if (Object.values(OwnerShipTypes).includes(key as OwnerShipTypes)) {
        return t(`ownership.types.${key}`);
      }
      return key;
    },
    [t],
  );

  const tabs = [
    { id: 'info', label: 'المعلومات' },
    { id: 'trips', label: 'الرحلات' },
    { id: 'maintenance', label: 'الصيانات' },
    { id: 'physical-attachments', label: tAttachments('tab') },
  ];

  if (isGetTrailerLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">حدث خطأ أثناء التحميل</div>;
  }

  return (
    <div className="pageContainer flex flex-col gap-6">
      <EntityHeader
        name={trailer?.code ?? `Trailer ${trailerId}`}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      <div className="w-full flex justify-center">
        <EntityToggleTabs
          tabs={tabs}
          value={activeTab}
          defaultTab="info"
          onChange={setActiveTab}
          containerClassName="max-w-full flex-wrap justify-center"
        />
      </div>

      {activeTab === 'info' && (
        <div className="flex flex-col gap-4">
          <InfoSection
            showEdit
            onEdit={() => handleEdit()}
            title="معلومات المقطورة"
            items={[
              {
                label: 'أقصى حمولة',
                value: trailer?.maxWeight
                  ? `${trailer.maxWeight} ${t('units.ton')}`
                  : EMPTY_DISPLAY,
              },
              { label: 'سنة الصنع', value: trailer?.manufactureYear ?? EMPTY_DISPLAY },
              {
                label: 'تاريخ انتهاء رخصة المقطورة',
                value: trailer?.licenseExpiryDate
                  ? new Date(trailer.licenseExpiryDate).toLocaleDateString('en-GB')
                  : EMPTY_DISPLAY,
              },
              {
                label: 'لون المقطورة',
                value: translateVehicleColor(tColors, trailer?.color, EMPTY_DISPLAY),
              },
              { label: 'رقم اللوحة', value: trailer?.plateNumber ?? EMPTY_DISPLAY },
              { label: 'حروف اللوحة', value: formatPlateLettersForDisplay(trailer?.plateLetters) },
              { label: 'رقم الشاسيه', value: trailer?.chassisNumber ?? EMPTY_DISPLAY },
              { label: 'رقم الرخصة', value: trailer?.licenseNumber ?? EMPTY_DISPLAY },
              {
                label: 'نوع الملكية',
                value: ownershipLabel(trailer?.ownerShip),
              },
              { label: 'ملاحظات', value: trailer?.notes || EMPTY_DISPLAY },
            ]}
          />
          <InfoSection
            showEdit
            onEdit={() => handleEdit('2')}
            title="ملكية المقطورة"
            items={[
              {
                label: 'نوع ملكية المقطورة',
                value: ownershipLabel(trailer?.ownerShip) || 'غير محدد',
              },
              {
                label: 'عدد الشركاء',
                value: trailer?.Ownerships?.length
                  ? `${trailer.Ownerships?.length} شركاء`
                  : 'غير محدد',
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'trips' && (
        <JourneyList scope={{ trailerId: Number(trailerId) }} showStats />
      )}

      {activeTab === 'maintenance' && <MaintenancePanel trailerId={Number(trailerId)} />}

      {activeTab === 'physical-attachments' && (
        <PhysicalAttachmentsPanel vehicleType="trailer" vehicleId={Number(trailerId)} />
      )}
    </div>
  );
}
