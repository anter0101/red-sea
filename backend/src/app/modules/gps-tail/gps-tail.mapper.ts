import { GpsTail } from './gps-tail.entity';
import { GpsTailDTO } from './dtos/gps-tail.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { GpsDevice } from '../gps-device/gps-device.entity';

const allowedGpsTailDtoKeys: ReadonlyArray<keyof GpsTailDTO | keyof BaseDTO> = [
  'id',
  'gpsDevice',
  'latitude',
  'longitude',
  'sequenceOrder',
  'timestamp',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

export function mapGpsTailToDtoSelective(
  tail: GpsTail,
  keys?: (keyof GpsTailDTO | keyof BaseDTO)[],
): Partial<GpsTailDTO>;

export function mapGpsTailToDtoSelective(
  tails: GpsTail[],
  keys?: (keyof GpsTailDTO | keyof BaseDTO)[],
): Partial<GpsTailDTO>[];

export function mapGpsTailToDtoSelective(
  data: GpsTail | GpsTail[],
  keys?: (keyof GpsTailDTO | keyof BaseDTO)[],
): Partial<GpsTailDTO> | Partial<GpsTailDTO>[] {
  const mapSingle = (tail: GpsTail): Partial<GpsTailDTO> => {
    const dto: Partial<GpsTailDTO> = {};

    const keysToMap = (keys || allowedGpsTailDtoKeys).filter((key) =>
      (allowedGpsTailDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in tail && (tail as any)[key] !== undefined) {
        (dto as any)[key] = (tail as any)[key];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

export const mapGpsTailDtoToEntity = (
  dto: GpsTailDTO,
  gpsDeviceId?: number, // <-- pass the parent device
): GpsTail => {
  const tail = new GpsTail();

  tail.latitude = dto.latitude;
  tail.longitude = dto.longitude;
  tail.sequenceOrder = dto.sequenceOrder;
  tail.timestamp = dto.timestamp ?? new Date();

  if (gpsDeviceId) {
    tail.gpsDevice = { id: gpsDeviceId } as GpsDevice;
  }

  return tail;
};
