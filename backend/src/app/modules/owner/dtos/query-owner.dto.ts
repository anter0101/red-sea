// src/owner/dtos/owner-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { transactionType } from 'src/core/enums/transaction-types';

export class OwnerQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Search by name, phone or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: transactionType })
  @IsOptional()
  @IsEnum(transactionType)
  transactionType?: transactionType;

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
