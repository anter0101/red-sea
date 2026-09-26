import { OmitType } from '@nestjs/swagger';
import { GpsDeviceDTO } from './gps-device.dto';

export class CreateGpsDeviceDTO extends OmitType(GpsDeviceDTO, ['id', 'updatedAt'] as const) {}
