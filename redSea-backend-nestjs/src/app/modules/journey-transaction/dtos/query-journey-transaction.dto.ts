import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { JourneyTransactionCategoryType, JourneyTransactionType } from 'src/core/enums/journey';

export class QueryJourneyTransactionDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Filter by journey ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId?: number;

  @ApiProperty({ required: false, enum: JourneyTransactionType })
  @IsOptional()
  @IsEnum(JourneyTransactionType)
  transactionType?: JourneyTransactionType;

  @ApiProperty({ required: false, enum: JourneyTransactionCategoryType })
  @IsOptional()
  @IsEnum(JourneyTransactionCategoryType)
  category?: JourneyTransactionCategoryType;

  @ApiProperty({
    required: false,
    description:
      'Search across all transaction + journey text fields (place, description, delegate number, etc.)',
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
