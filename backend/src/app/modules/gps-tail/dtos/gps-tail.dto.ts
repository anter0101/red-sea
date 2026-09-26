import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsNumber } from 'class-validator';
import { GpsDeviceDTO } from '../../gps-device/dtos/gps-device.dto';

export class GpsTailDTO extends BaseDTO {
  @ApiProperty({ description: 'Latitude', example: 24.7136 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: 46.6753 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Sequence order', example: 10 })
  @IsNumber()
  sequenceOrder: number;

  @ApiProperty({ description: 'Time stamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Device ID' })
  gpsDevice: GpsDeviceDTO;
}
