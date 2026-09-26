import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginateDTO {
  @ApiProperty({
    required: false,
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Field to sort by. When omitted, lists default to id DESC (newest first).',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({
    required: false,
    description: 'Sort order when sortField is set (defaults to ASC for that field).',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
