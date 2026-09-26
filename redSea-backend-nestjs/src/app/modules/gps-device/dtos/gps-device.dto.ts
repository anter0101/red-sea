import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { GpsTailDTO } from '../../gps-tail/dtos/gps-tail.dto';
import { CarDTO } from '../../car/dtos/car.dto';
// import { CarDTO } from '../../car/dtos/car.dto';

export class GpsDeviceDTO extends BaseDTO {
  @ApiProperty({ description: 'Device name', example: 'Tracker A1' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'IMEI number', example: '8675309' })
  @IsString()
  imei: string;

  @ApiPropertyOptional({ description: 'Last latitude', example: 24.7136 })
  @IsNumber()
  @IsOptional()
  lastLatitude?: number;

  @ApiPropertyOptional({ description: 'Last longitude', example: 46.6753 })
  @IsNumber()
  @IsOptional()
  lastLongitude?: number;

  @ApiPropertyOptional({ description: 'Speed (km/h)', example: 80 })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiPropertyOptional({ description: 'Total distance (km)', example: 1200 })
  @IsNumber()
  @IsOptional()
  totalDistance?: number;

  @ApiPropertyOptional({ description: 'Battery level (%)', example: 85 })
  @IsNumber()
  @IsOptional()
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Signal strength (%)', example: 90 })
  @IsNumber()
  @IsOptional()
  signalStrength?: number;

  @ApiPropertyOptional({ description: 'Engine running status', example: true })
  @IsBoolean()
  @IsOptional()
  engineStatus: boolean;

  @ApiPropertyOptional({ description: 'Last update timestamp' })
  @IsOptional()
  lastUpdate?: Date;

  @ApiPropertyOptional({ description: 'GPS tails (location history)' })
  @IsOptional()
  gpsTail?: GpsTailDTO[];

  car?: CarDTO | null;
}
