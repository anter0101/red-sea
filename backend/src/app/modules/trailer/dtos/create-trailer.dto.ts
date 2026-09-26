import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { TrailerDTO } from './trailer.dto';

const isFullTrailer = (dto: CreateTrailerDTO) => dto.ownerShip !== OwnerShipType.NOLON_CAR;

export class CreateTrailerDTO extends OmitType(TrailerDTO, [
  'id',
  'code',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'chaseType',
  'manufacturer',
  'status',
  'manufactureYear',
  'color',
  'axleCount',
  'maxWeight',
  'plateNumber',
  'plateLetters',
  'chassisNumber',
  'licenseNumber',
  'licenseExpiryDate',
  'ownerShip',
  'axles',
] as const) {
  @ApiProperty({ enum: OwnerShipType })
  @IsEnum(OwnerShipType)
  ownerShip: OwnerShipType;

  @ApiPropertyOptional({ example: 'Semi-Trailer' })
  @ValidateIf(isFullTrailer)
  @IsString()
  chaseType?: string;

  @ApiPropertyOptional({ example: 'Schmitz' })
  @ValidateIf(isFullTrailer)
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: VeachleStatus.UNAVILABLE })
  @ValidateIf(isFullTrailer)
  @IsEnum(VeachleStatus)
  status?: VeachleStatus;

  @ApiPropertyOptional({ example: 2022 })
  @ValidateIf(isFullTrailer)
  @IsInt()
  manufactureYear?: number;

  @ApiPropertyOptional({ example: 'White' })
  @ValidateIf(isFullTrailer)
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 2, description: 'Number of axles on the trailer' })
  @ValidateIf(isFullTrailer)
  @IsInt()
  axleCount?: number;

  @ApiPropertyOptional({ example: 24, description: 'Max weight in tons' })
  @ValidateIf(isFullTrailer)
  @IsInt()
  maxWeight?: number;

  @ApiProperty({ example: '5678' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'XYZ' })
  @IsString()
  plateLetters: string;

  @ApiPropertyOptional({ example: 'TRLR9323031L999999' })
  @ValidateIf(isFullTrailer)
  @IsString()
  chassisNumber?: string;

  @ApiProperty({ example: 'LIC-554433' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2027-01-10' })
  @IsDateString()
  licenseExpiryDate: Date;

  @ApiPropertyOptional({ type: [Number], description: 'Axle IDs' })
  @ValidateIf(isFullTrailer)
  @IsOptional()
  @IsArray()
  axles?: number[];
}
