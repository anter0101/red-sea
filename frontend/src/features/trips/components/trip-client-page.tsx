'use client';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { mapToInfoItems } from '@/utils/generic-field-mapper';
import ActivityToolbar from './transactions-toolbar';
import TransactionsTable from './transactions-table';

import { useMemo, useState } from 'react';
import { useGetJourneyHistory } from '../api/get-one/get-journey-history';

import { useGetAllTransactionsByJourney } from '../api/get-all/get-all-transactions';
import { useGetOneEmployee } from '../api/get-one/get-one-employee';
import { useGetOneInfo } from '../api/get-one/get-one-info';
import { useGetOneVehicle } from '../api/get-one/get-one-vehicle';

import { employeeFields } from '../mappers/employee-info.fields';
import { logisticsInfoFields } from '../mappers/logistics-info.fields';
import { tripInfoFields } from '../mappers/trip-info.fields';
import { vehicleFields } from '../mappers/vehicle-info.fields';
import {
  mapTripTransactionRow,
  tripTransactionsExportColumns,
} from '../transactions-export.config';
import { useTableExport } from '@/hooks/use-table-export';
import { JOURNEY_STATUS_LABELS } from '../constants/journey-status';

export default function TripClientPage({ journeyId }: { journeyId: number }) {
  const { transactions } = useGetAllTransactionsByJourney(String(journeyId));
  const { tripInfo } = useGetOneInfo(journeyId);
  const { vehicleInfo } = useGetOneVehicle(journeyId);
  const { employeeInfo } = useGetOneEmployee(journeyId);
  const { data: history, isPending: isHistoryPending } = useGetJourneyHistory(journeyId);

  const [activeTab, setActiveTab] = useState('trip-info');

  const transactionExportParams = useMemo(() => ({ journeyId }), [journeyId]);

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/journey-transactions',
    params: transactionExportParams,
    columns: tripTransactionsExportColumns(),
    mapRow: mapTripTransactionRow,
    fileName: `trip-${journeyId}-transactions`,
    enabled: !!journeyId,
  });

  const tabs = [
    { id: 'trip-info', label: 'معلومات الرحلة' },
    { id: 'activities', label: 'الآنشطة المالية' },
    { id: 'employees', label: ' العاملين' },
    { id: 'history', label: 'سجل الحالة' },
  ];

  const tripInfoItems = mapToInfoItems(tripInfo, tripInfoFields);
  const logisticsInfoItems = mapToInfoItems(tripInfo, logisticsInfoFields);
  const carInfoItems = mapToInfoItems(vehicleInfo, vehicleFields);
  const workersInfoItems = mapToInfoItems(employeeInfo, employeeFields);

  return (
    <div className="pageContainer">
      <div className="w-full flex justify-center">
        <EntityToggleTabs tabs={tabs} defaultTab="trip-info" onChange={setActiveTab} />
      </div>

      {activeTab === 'activities' && (
        <div className="flex flex-col gap-2">
          <ActivityToolbar onExport={exportData} isExporting={isExporting} />
          <TransactionsTable data={transactions} />
        </div>
      )}

      {activeTab === 'trip-info' && (
        <div className="flex gap-2">
          <InfoSection title="بيانات الرحلة" items={tripInfoItems} showEdit={false} />

          <InfoSection title="المعلومات اللوجستية" items={logisticsInfoItems} showEdit={false} />
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="flex gap-2">
          <InfoSection title="معلومات السيارة" items={carInfoItems} showEdit={false} />
          <InfoSection title="معلومات العاملين" items={workersInfoItems} showEdit={false} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold mb-4">سجل الحالة</h2>
          {isHistoryPending ? (
            <p className="text-center text-muted-foreground">جاري التحميل...</p>
          ) : !history?.length ? (
            <p className="text-center text-muted-foreground">لا يوجد سجل حالة</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-center">
                    <th className="p-2">من</th>
                    <th className="p-2">إلى</th>
                    <th className="p-2">بواسطة</th>
                    <th className="p-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="p-2">
                        {event.fromStatus
                          ? (JOURNEY_STATUS_LABELS[event.fromStatus] ?? event.fromStatus)
                          : '-'}
                      </td>
                      <td className="p-2">
                        {JOURNEY_STATUS_LABELS[event.toStatus] ?? event.toStatus}
                      </td>
                      <td className="p-2">{event.changedBy ?? '-'}</td>
                      <td className="p-2">
                        {event.createdAt
                          ? new Date(event.createdAt).toLocaleString('ar-EG')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
