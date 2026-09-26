import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';

import { TrailerAttachmentDTO } from '../../trailer-attachment/dtos/trailer-attachment.dto';
import { AxleDTO } from '../../axle/dtos/axle.dto';
import { RelTrailerOwnerDTO } from '../../rel-trailer-owner/dtos/rel-trailer-owner.dto';

import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export class TrailerDTO extends BaseDTO {
  @ApiProperty({ example: 'T001' })
  @IsString()
  @IsOptional()
  code: string;

  @ApiPropertyOptional({ example: 'Semi-Trailer' })
  @IsString()
  @IsOptional()
  chaseType?: string;

  @ApiPropertyOptional({ example: 'Schmitz' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: VeachleStatus.UNAVILABLE })
  @IsEnum(VeachleStatus)
  status: VeachleStatus;

  @ApiPropertyOptional({ example: 2022 })
  @IsInt()
  @IsOptional()
  manufactureYear?: number;

  @ApiPropertyOptional({ example: 'White' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 2, description: 'Number of axles on the trailer' })
  @IsInt()
  @IsOptional()
  axleCount?: number;

  @ApiPropertyOptional({ example: 24, description: 'Max weight in tons' })
  @IsInt()
  @IsOptional()
  maxWeight?: number;

  @ApiProperty({ example: '5678' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'XYZ' })
  @IsString()
  plateLetters: string;

  @ApiPropertyOptional({ example: 'TRLR9323031L999999' })
  @IsString()
  @IsOptional()
  chassisNumber?: string;

  @ApiProperty({ example: 'LIC-554433' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2027-01-10' })
  @IsDateString()
  licenseExpiryDate: Date;

  @ApiPropertyOptional({ example: 'Refrigerated trailer' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: OwnerShipType })
  @IsOptional()
  @IsString()
  ownerShip?: OwnerShipType;

  @ApiPropertyOptional({
    description: 'Associated Trailer Attachments',
    type: () => TrailerAttachmentDTO,
  })
  trailerAttachments?: TrailerAttachmentDTO[];

  @ApiPropertyOptional({
    description: 'Associated Axles for the trailer',
    type: () => AxleDTO,
  })
  axles?: AxleDTO[];

  @ApiPropertyOptional({
    description: 'Associated Owners for the trailer',
    type: () => RelTrailerOwnerDTO,
  })
  Ownerships?: RelTrailerOwnerDTO[];
}
