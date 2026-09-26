import { GpsDevice } from './gps-device.entity';
import { GpsDeviceDTO } from './dtos/gps-device.dto';
import { CreateGpsDeviceDTO } from './dtos/create-gps-device.dto';
import { UpdateGpsDeviceDTO } from './dtos/update-gps-device.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { mapGpsTailDtoToEntity } from '../gps-tail/gps-tail.mapper'; // Assume this now accepts optional deviceId
import { Car } from '../car/car.entity';

const allowedGpsDeviceDtoKeys: ReadonlyArray<keyof GpsDeviceDTO | keyof BaseDTO> = [
  'id',
  'name',
  'imei',
  'car',
  'gpsTail',
  'lastLatitude',
  'lastLongitude',
  'speed',
  'totalDistance',
  'batteryLevel',
  'signalStrength',
  'engineStatus',
  'lastUpdate',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapGpsDeviceToDtoSelective(
  device: GpsDevice,
  keys?: (keyof GpsDeviceDTO | keyof BaseDTO)[],
): Partial<GpsDeviceDTO>;

export function mapGpsDeviceToDtoSelective(
  devices: GpsDevice[],
  keys?: (keyof GpsDeviceDTO | keyof BaseDTO)[],
): Partial<GpsDeviceDTO>[];

export function mapGpsDeviceToDtoSelective(
  data: GpsDevice | GpsDevice[],
  keys?: (keyof GpsDeviceDTO | keyof BaseDTO)[],
): Partial<GpsDeviceDTO> | Partial<GpsDeviceDTO>[] {
  const mapSingle = (device: GpsDevice): Partial<GpsDeviceDTO> => {
    const dto: Partial<GpsDeviceDTO> = {};

    const keysToMap = (keys || allowedGpsDeviceDtoKeys).filter((key) =>
      (allowedGpsDeviceDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in device && (device as any)[key] !== undefined) {
        (dto as any)[key] = (device as any)[key];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export const mapCreateGpsDeviceDtoToEntity = (dto: CreateGpsDeviceDTO): GpsDevice => {
  const entity = new GpsDevice();
  // only set relation id via placeholder entity

  entity.name = dto.name;
  entity.imei = dto.imei;
  entity.lastLatitude = dto.lastLatitude;
  entity.lastLongitude = dto.lastLongitude;
  entity.speed = dto.speed;
  entity.totalDistance = dto.totalDistance;
  entity.batteryLevel = dto.batteryLevel;
  entity.signalStrength = dto.signalStrength;
  entity.engineStatus = dto.engineStatus ?? false;
  entity.lastUpdate = dto.lastUpdate;

  if (dto.gpsTail) {
    entity.gpsTail = dto.gpsTail.map((tailDto) => mapGpsTailDtoToEntity(tailDto)); // No deviceId for new entities
  }
  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;
  return entity;
};

export const mapUpdateGpsDeviceDtoToEntity = (
  dto: UpdateGpsDeviceDTO,
  existing: GpsDevice,
): GpsDevice => {
  if (dto.name !== undefined) existing.name = dto.name;
  if (dto.imei !== undefined) existing.imei = dto.imei;
  if (dto.lastLatitude !== undefined) existing.lastLatitude = dto.lastLatitude;
  if (dto.lastLongitude !== undefined) existing.lastLongitude = dto.lastLongitude;
  if (dto.speed !== undefined) existing.speed = dto.speed;
  if (dto.totalDistance !== undefined) existing.totalDistance = dto.totalDistance;
  if (dto.batteryLevel !== undefined) existing.batteryLevel = dto.batteryLevel;
  if (dto.signalStrength !== undefined) existing.signalStrength = dto.signalStrength;
  if (dto.engineStatus !== undefined) existing.engineStatus = dto.engineStatus;
  if (dto.lastUpdate !== undefined) existing.lastUpdate = dto.lastUpdate;
  if (dto.createdAt !== undefined) existing.createdAt = dto.createdAt;
  if (dto.carId !== undefined) existing.car = { id: dto.carId } as Car;
  return existing;
};

export const mapGpsItemsTODB = (gpsArray: any[]): CreateGpsDeviceDTO[] => {
  const devices: CreateGpsDeviceDTO[] = [];

  if (!Array.isArray(gpsArray) || gpsArray.length === 0) return devices;

  const mainObj = gpsArray[0];
  const items = Array.isArray(mainObj.items) ? mainObj.items : [];

  for (const item of items) {
    const device: CreateGpsDeviceDTO = {
      name: item?.device_data?.name ?? item?.name ?? 'Unknown Device',
      imei: item?.device_data?.imei ?? item?.imei ?? '',
      lastLatitude: item?.lat ?? item?.device_data?.lastValidLatitude ?? undefined,
      lastLongitude: item?.lng ?? item?.device_data?.lastValidLongitude ?? undefined,
      speed: typeof item?.speed === 'number' ? item.speed : undefined,
      totalDistance: typeof item?.total_distance === 'number' ? item.total_distance : undefined,
      batteryLevel: undefined,
      signalStrength: undefined,
      engineStatus: Boolean(item?.engine_status),
      lastUpdate: item?.timestamp ? new Date(item.timestamp * 1000) : undefined,
      gpsTail: [],
    };

    const batterySensor = item?.sensors?.find((s: any) => s.type === 'battery');
    device.batteryLevel = typeof batterySensor?.val === 'number' ? batterySensor.val : undefined;

    const signalSensor = item?.sensors?.find((s: any) => s.type === 'gsm');
    device.signalStrength = typeof signalSensor?.val === 'number' ? signalSensor.val : undefined;

    if (Array.isArray(item.tail) && item.tail.length > 0) {
      device.gpsTail = item.tail.map((point: any, index: number) => ({
        latitude: parseFloat(point.lat),
        longitude: parseFloat(point.lng),
        sequenceOrder: index + 1,
        timestamp: item.timestamp ? new Date(item.timestamp * 1000) : new Date(),
      }));
    }

    devices.push(device);
  }

  return devices;
};
