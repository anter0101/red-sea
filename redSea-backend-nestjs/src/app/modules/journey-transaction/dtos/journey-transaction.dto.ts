import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { JourneyTransactionCategoryType, JourneyTransactionType } from 'src/core/enums/journey';
import { JourneyDTO } from '../../journey/dtos/journey.dto';

export class JourneyTransactionDTO extends BaseDTO {
  @ApiProperty({ enum: JourneyTransactionType })
  @IsEnum(JourneyTransactionType)
  transactionType: JourneyTransactionType;

  @ApiProperty({ description: 'Category like port_fees, fuel, total_revenue, etc.' })
  @IsEnum(JourneyTransactionCategoryType)
  category: JourneyTransactionCategoryType;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Quantity (liters, count, etc.)' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit price (when applicable)' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Place or service name (gas station, toll place, etc.)' })
  @IsOptional()
  @IsString()
  placeOrService?: string;

  @ApiPropertyOptional({ description: 'Invoice URL' })
  @IsOptional()
  @IsString()
  invoiceUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: () => JourneyDTO })
  journey: JourneyDTO;
}
