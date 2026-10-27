import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class CarModelQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Exact name filter' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Filter by manufacturer ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  manufacturerId?: number;

  @ApiProperty({
    required: false,
    description: 'Search by name or manufacturer name (partial, case-insensitive)',
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
