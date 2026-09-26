'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { translateVehicleColor } from '@/data/vehicle-colors';
import MaintenancePanel from '@/features/maintenance/components/maintenance-panel';
import { PhysicalAttachmentsPanel } from '@/features/physical-attachments';
import JourneyList from '@/features/trips/components/journey-list';
import { formatPlateLettersForDisplay } from '@/lib/plate-letters';

import { useCarPage } from '../hooks/use-car-page';

export default function CarPageClient({ carId }: { carId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const t = useTranslations('cars');
  const tAttachments = useTranslations('physicalAttachments');
  const tVehicleColors = useTranslations('common.vehicle-colors');
  const { car, isGetCarLoading, error, activeTab, setActiveTab, handleDelete } = useCarPage(
    Number(carId),
  );

  const handleEdit = (step?: string) => {
    router.push(`/cars/${carId}/update${step ? `?step=${step}` : ''}`);
  };

  const tabs = [
    { id: 'info', label: 'المعلومات' },
    { id: 'trips', label: 'الرحلات' },
    { id: 'maintenance', label: 'الصيانات' },
    { id: 'physical-attachments', label: tAttachments('tab') },
  ];

  if (isGetCarLoading) {
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
        name={car?.code ?? `Car ${carId}`}
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

      {activeTab === 'info' && car && (
        <div className="flex flex-col gap-4">
          <InfoSection
            showEdit
            onEdit={() => handleEdit()}
            title="معلومات السيارة"
            items={[
              { label: 'كود السيارة', value: car.code ?? '' },
              { label: 'المصنّع', value: car.manufacturer ?? '' },
              { label: 'الموديل', value: car.model ?? '' },
              {
                label: 'سنة الصنع',
                value: car.manufactureYear?.toString() ?? '',
              },
              {
                label: 'الحالة',
                value: t(`statuses.${car.status}`) ?? '',
              },
              {
                label: 'لون السيارة',
                value: translateVehicleColor(tVehicleColors, car.color) ?? '',
              },
              { label: 'عدد المحاور', value: car.axleCount?.toString() ?? '' },
              {
                label: t('fields.max-weight'),
                value: car.maxWeight ? `${car.maxWeight} ${t('units.ton')}` : '',
              },
              { label: ' رقم اللوحة', value: car.plateNumber ?? '' },
              { label: 'حروف اللوحة', value: formatPlateLettersForDisplay(car.plateLetters) },
              { label: 'رقم الشاسيه', value: car.chassisNumber ?? '' },
              { label: 'رقم الرخصة', value: car.licenseNumber ?? '' },
              {
                label: 'تاريخ انتهاء الرخصة',
                value: car.licenseExpiryDate
                  ? new Date(car.licenseExpiryDate).toLocaleDateString('en-GB')
                  : '',
              },
              { label: 'ملاحظات', value: car.notes ?? '—' },
              { label: 'اضيف بواسطة', value: car.createdBy ?? '' },
            ]}
          />

          <InfoSection
            showEdit
            onEdit={() => handleEdit('2')}
            title="ملكية السيارة"
            items={[
              {
                label: 'نوع ملكية السيارة',
                value: t(`ownership.types.${car?.ownerShip}`) ?? 'غير محدد',
              },
              {
                label: 'عدد الشركاء',
                value: car?.Ownerships?.length ? `${car.Ownerships?.length} شركاء` : 'غير محدد',
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'trips' && <JourneyList scope={{ carId: Number(carId) }} showStats />}

      {activeTab === 'maintenance' && <MaintenancePanel carId={Number(carId)} />}

      {activeTab === 'physical-attachments' && (
        <PhysicalAttachmentsPanel vehicleType="car" vehicleId={Number(carId)} />
      )}
    </div>
  );
}
