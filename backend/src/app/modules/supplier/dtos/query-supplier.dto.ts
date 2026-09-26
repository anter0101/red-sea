import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { SupplierType } from '../enums/supplier-type.enum';

export class SupplierQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Search by code, name, phone or government name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

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
