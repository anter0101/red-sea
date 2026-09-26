import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class QueryPhysicalAttachmentDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Filter by car ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  carId?: number;

  @ApiProperty({ required: false, description: 'Filter by trailer ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  trailerId?: number;

  @ApiProperty({ required: false, description: 'Search across name / description' })
  @IsOptional()
  @IsString()
  search?: string;
}
