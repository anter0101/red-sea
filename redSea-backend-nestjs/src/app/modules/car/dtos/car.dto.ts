import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { CarAttachmentDTO } from '../../car-attachment/dtos/car-attachment.dto';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { AxleDTO } from '../../axle/dtos/axle.dto';
import { RelCarOwnerDTO } from '../../rel-car-owner/dtos/rel-car-owner.dto';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export class CarDTO extends BaseDTO {
  @ApiProperty({ example: 'C001' })
  @IsString()
  @IsOptional()
  code: string;

  @ApiProperty({ example: 'Mercedes' })
  @IsString()
  manufacturer: string;

  @ApiProperty({ example: VeachleStatus.ONROAD })
  @IsEnum(VeachleStatus)
  status: VeachleStatus;

  @ApiProperty({ example: 'Actros 2040' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  manufactureYear: number;

  @ApiProperty({ example: 'Red' })
  @IsString()
  color: string;

  @ApiProperty({ example: 6 })
  @IsInt()
  cylinders: number;

  @ApiProperty({ example: 500 })
  @IsInt()
  horsepower: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  axleCount: number;

  @ApiProperty({ example: 18, description: 'Max weight in tons' })
  @IsInt()
  maxWeight: number;

  @ApiProperty({ example: '1234' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'ABC' })
  @IsString()
  plateLetters: string;

  @ApiProperty({ example: 'WDB9323031L123456' })
  @IsString()
  chassisNumber: string;

  @ApiProperty({ example: 'LIC-993388' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsDateString()
  licenseExpiryDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: OwnerShipType })
  @IsOptional()
  @IsEnum(OwnerShipType)
  ownerShip?: OwnerShipType;

  @ApiPropertyOptional({
    description: 'Associated CarAttachments for the cars',
    type: () => CarAttachmentDTO,
  })
  carAttachments?: CarAttachmentDTO[];

  @ApiPropertyOptional({
    description: 'Associated Axles for the car',
    type: () => AxleDTO,
  })
  axles?: AxleDTO[];

  @ApiPropertyOptional({
    description: 'Associated Owners for the car',
    type: () => RelCarOwnerDTO,
  })
  Ownerships?: RelCarOwnerDTO[];
}
