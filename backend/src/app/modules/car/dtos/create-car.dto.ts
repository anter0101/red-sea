import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';
import { CarDTO } from './car.dto';

const isFullCar = (dto: CreateCarDTO) => dto.ownerShip !== OwnerShipType.NOLON_CAR;

export class CreateCarDTO extends OmitType(CarDTO, [
  'id',
  'code',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'manufacturer',
  'status',
  'model',
  'manufactureYear',
  'color',
  'cylinders',
  'horsepower',
  'axleCount',
  'maxWeight',
  'plateNumber',
  'plateLetters',
  'chassisNumber',
  'licenseNumber',
  'licenseExpiryDate',
  'ownerShip',
] as const) {
  @ApiProperty({ enum: OwnerShipType })
  @IsEnum(OwnerShipType)
  ownerShip: OwnerShipType;

  @ApiPropertyOptional({ example: 'Mercedes' })
  @ValidateIf(isFullCar)
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: VeachleStatus.ONROAD })
  @ValidateIf(isFullCar)
  @IsEnum(VeachleStatus)
  status?: VeachleStatus;

  @ApiPropertyOptional({ example: 'Actros 2040' })
  @ValidateIf(isFullCar)
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @ValidateIf(isFullCar)
  @IsInt()
  manufactureYear?: number;

  @ApiPropertyOptional({ example: 'Red' })
  @ValidateIf(isFullCar)
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 6 })
  @ValidateIf(isFullCar)
  @IsInt()
  cylinders?: number;

  @ApiPropertyOptional({ example: 500 })
  @ValidateIf(isFullCar)
  @IsInt()
  horsepower?: number;

  @ApiPropertyOptional({ example: 3 })
  @ValidateIf(isFullCar)
  @IsInt()
  axleCount?: number;

  @ApiPropertyOptional({ example: 18, description: 'Max weight in tons' })
  @ValidateIf(isFullCar)
  @IsInt()
  maxWeight?: number;

  @ApiProperty({ example: '1234' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'ABC' })
  @IsString()
  plateLetters: string;

  @ApiPropertyOptional({ example: 'WDB9323031L123456' })
  @ValidateIf(isFullCar)
  @IsString()
  chassisNumber?: string;

  @ApiProperty({ example: 'LIC-993388' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsDateString()
  licenseExpiryDate: Date;
}
