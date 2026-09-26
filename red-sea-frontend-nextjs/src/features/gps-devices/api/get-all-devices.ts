import { useGetPaginated } from '@/hooks/base/get-paginated';
import { IQueryParams } from '@/types';

import { IDeviceResponse } from '../types/device';

export interface IDeviceTableRow {
  id: number;
  name: string;
  imei: string;
  speed: string;
  location: string;
  engineStatus: string;
  signalStrength: string;
  batteryLevel: string;
  lastUpdate: string;
  carLicense: string;
}

interface DevicesQueryParams extends IQueryParams {}

export function mapDeviceRow(device: IDeviceResponse): IDeviceTableRow {
  const lat = device.lastLatitude;
  const lng = device.lastLongitude;
  const location = lat != null && lng != null ? `${lat}, ${lng}` : '-';

  return {
    id: device.id as number,
    name: device.name || '-',
    imei: device.imei || '-',
    speed: `${device.speed ?? 0} km/h`,
    location,
    engineStatus: device.engineStatus ? 'تشغيل' : 'إيقاف',
    signalStrength: device.signalStrength != null ? `${device.signalStrength}%` : '-',
    batteryLevel:
      device.batteryLevel !== null && device.batteryLevel !== undefined
        ? `${device.batteryLevel}%`
        : '-',
    lastUpdate: device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : '-',
    carLicense: device.car?.licenseNumber || '-',
  };
}

export const useGetAllDevices = (params?: DevicesQueryParams) => {
  const { data, isPending } = useGetPaginated<IDeviceResponse>({
    endPoint: `/api/gps-devices`,
    queryKey: ['api', 'gps-devices'],
    params,
  });
  const devices: IDeviceResponse[] = data?.data ?? [];
  const totalDevicesCount = data?.totalCount ?? 0;
  return {
    devices,
    isPending,
    totalDevicesCount,
  };
};
