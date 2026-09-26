import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AccountDTO } from '../../account/dtos/account.dto';
import { Type } from 'class-transformer';
import { EntryType } from '../transaction-line.entity';

export class TransactionLineDTO extends BaseDTO {
  @ApiPropertyOptional({ description: 'Account details', type: () => AccountDTO })
  @Type(() => AccountDTO)
  account?: AccountDTO;

  @ApiProperty({ description: 'Entry type', enum: EntryType })
  @IsEnum(EntryType)
  entryType: EntryType;

  @ApiProperty({ description: 'Amount', example: 1000.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Line description' })
  @IsOptional()
  @IsString()
  description?: string;
}
