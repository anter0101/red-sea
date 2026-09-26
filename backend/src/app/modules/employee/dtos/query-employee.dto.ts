import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class EmployeeQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Filter by branch ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  branchId?: number;

  @ApiProperty({
    required: false,
    description: 'Search across all employee + user + branch text fields',
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
