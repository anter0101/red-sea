'use client';
import React, { useMemo, useState } from 'react';
import { useGetOneDevice } from '../api/get-one';
import { useGetAllDeviceTails } from '../api/get-all-tails';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import ExportButton from '@/components/common/export-button';
import InfoSection from '@/components/common/info-section';
import AssignCarDeviceDialog from './assing-car-form';
import DeviceTailsTable from './tails-table';
import { gpsTailsExportColumns, mapGpsTailRow } from '../export-tails.config';
import { useTableExport } from '@/hooks/use-table-export';

export default function DeviceClientPage({ deviceId }: { deviceId: string }) {
  const { Device, isGetDeviceLoading } = useGetOneDevice(deviceId);
  const { deviceTails, isPending } = useGetAllDeviceTails(deviceId);
  const [activeTab, setActiveTab] = useState('device-info');

  const tailExportParams = useMemo(() => ({ gpsDeviceId: deviceId }), [deviceId]);

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/gps-tails',
    params: tailExportParams,
    columns: gpsTailsExportColumns(),
    mapRow: mapGpsTailRow,
    fileName: `gps-device-${deviceId}-tails`,
    enabled: !!deviceId,
  });

  // For Assign Car Dialog
  const [openAssign, setOpenAssign] = useState(false);

  const tabs = [
    { id: 'device-info', label: 'معلومات الجهاز' },
    { id: 'activities', label: 'تحركات السيارة' },
  ];

  const deviceInfoItems = [
    { label: 'اسم الجهاز', value: Device?.name || '-' },
    { label: 'IMEI', value: Device?.imei || '-' },
    { label: 'السرعة', value: Device?.speed ? `${Device.speed} km/h` : '-' },
    { label: 'حالة المحرك', value: Device?.engineStatus ? 'تشغيل' : 'إيقاف' },
    { label: 'الإشارة', value: Device?.signalStrength ?? '-' },
    { label: 'البطارية', value: Device?.batteryLevel != null ? `${Device.batteryLevel}%` : '-' },
    {
      label: 'آخر تحديث',
      value: Device?.lastUpdate ? new Date(Device.lastUpdate).toLocaleString() : '-',
    },
  ];

  const carInfoItems = Device?.car
    ? [
        { label: 'الكود', value: Device.car.code || '-' },
        { label: 'الشركة المصنعة', value: Device.car.manufacturer || '-' },
        { label: 'الحالة', value: Device.car.status || '-' },
        { label: 'موديل', value: Device.car.model || '-' },
        { label: 'سنة الصنع', value: Device.car.manufactureYear || '-' },
        { label: 'اللون', value: Device.car.color || '-' },
        { label: 'عدد الأسطوانات', value: Device.car.cylinders || '-' },
        { label: 'قوة المحرك (حصان)', value: Device.car.horsepower || '-' },
        { label: 'عدد المحاور', value: Device.car.axleCount || '-' },
        { label: 'الحمولة القصوى', value: Device.car.maxWeight || '-' },
        { label: 'رقم اللوحة', value: Device.car.plateNumber || '-' },
        { label: 'حروف اللوحة', value: Device.car.plateLetters || '-' },
        { label: 'رقم الشاصي', value: Device.car.chassisNumber || '-' },
        { label: 'رقم الترخيص', value: Device.car.licenseNumber || '-' },
        { label: 'تاريخ انتهاء الترخيص', value: Device.car.licenseExpiryDate || '-' },
        { label: 'ملاحظات', value: Device.car.notes || '-' },
        { label: 'نوع الملكية', value: Device.car.ownerShip || '-' },
        { label: 'المرفقات', value: Device.car.carAttachments?.length || 0 },
        { label: 'المحاور', value: Device.car.axles?.length || 0 },
        { label: 'الملكية السابقة', value: Device.car.Ownerships?.length || 0 },
      ]
    : [
        {
          label: 'الحالة',
          value: 'لا يوجد بيانات متاحة',
        },
      ];

  return (
    <div className="pageContainer">
      <div className="w-full flex justify-center mb-4">
        <EntityToggleTabs tabs={tabs} defaultTab="device-info" onChange={setActiveTab} />
      </div>

      {activeTab === 'device-info' && (
        <div className="flex flex-col gap-4">
          <InfoSection title="معلومات الجهاز" items={deviceInfoItems} showEdit={false} />

          {
            <InfoSection
              title="معلومات السيارة"
              items={carInfoItems}
              showEdit={false}
              onCreate={() => setOpenAssign(true)}
              showCreate={true}
            />
          }
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <ExportButton onExport={exportData} isExporting={isExporting} />
          </div>
          <DeviceTailsTable tails={deviceTails} />
        </div>
      )}

      {/* Assign Car Dialog */}
      {Device?.id && (
        <AssignCarDeviceDialog
          open={openAssign}
          onOpenChange={setOpenAssign}
          deviceId={Device.id}
        />
      )}
    </div>
  );
}
