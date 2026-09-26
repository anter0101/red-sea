import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class GpsTailQueryDTO extends PaginateDTO {
  @ApiPropertyOptional({ description: 'Filter by GPS device ID', example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  gpsDeviceId?: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtFrom?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtTo?: string;
}
