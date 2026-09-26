import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JourneyStatus } from 'src/core/enums/journey';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class JourneyQueryDTO extends PaginateDTO {
  @ApiProperty({
    required: false,
    description:
      'Search across all journey text fields and relations: delegate number, plate number, driver name, client name, policy no, archive no, delivery area/gov, etc.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: JourneyStatus })
  @IsOptional()
  @IsEnum(JourneyStatus)
  tripStatus?: JourneyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtTo?: string;

  @ApiProperty({ required: false, description: 'Filter by driver id (journeys.driver_id)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverId?: number;

  @ApiProperty({ required: false, description: 'Filter by car id (journeys.car_id)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  carId?: number;

  @ApiProperty({ required: false, description: 'Filter by trailer id (journeys.trailer_id)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  trailerId?: number;

  @ApiProperty({ required: false, description: 'Filter by client id (journeys.client_id)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  clientId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by driver assistant user id (journeys.assistant_id)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverAssistantId?: number;

  @ApiProperty({
    required: false,
    description:
      'Filter by branch: custody source employee branch OR latest policy employee branch',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  branchId?: number;
}
