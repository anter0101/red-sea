import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { GpsDeviceDTO } from './gps-device.dto';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateGpsDeviceDTO extends PartialType(GpsDeviceDTO) {
  @ApiPropertyOptional({
    description: 'Device ID',
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  carId: number;
}
