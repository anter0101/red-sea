import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class BranchQueryDTO extends PaginateDTO {
  @ApiProperty({
    required: false,
    description: 'Search by branch name (partial, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter branches created on or after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filter branches created on or before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;
}
