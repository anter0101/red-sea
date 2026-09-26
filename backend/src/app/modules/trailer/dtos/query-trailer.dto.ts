// src/trailer/dtos/query-trailer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';

export class QueryTrailerDto extends PaginateDTO {
  @ApiProperty({
    required: false,
    description: 'Search by code, plateNumber, chassisNumber or licenseNumber',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: VeachleStatus })
  @IsOptional()
  @IsEnum(VeachleStatus)
  status?: VeachleStatus;

  @ApiProperty({ required: false, enum: OwnerShipType })
  @IsOptional()
  @IsEnum(OwnerShipType)
  ownerShip?: OwnerShipType;

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
}
