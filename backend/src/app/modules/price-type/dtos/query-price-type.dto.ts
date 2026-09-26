import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PackingType } from 'src/core/enums/packing-type';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class PriceTypeQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, enum: PackingType, description: 'Exact name filter' })
  @IsOptional()
  @IsEnum(PackingType)
  name?: PackingType;

  @ApiProperty({
    required: false,
    description: 'Search by description (partial, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
