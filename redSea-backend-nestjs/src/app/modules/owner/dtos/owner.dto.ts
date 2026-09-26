// src/owner/dtos/owner.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional } from 'class-validator';
import { RelCarOwnerDTO } from '../../rel-car-owner/dtos/rel-car-owner.dto';
import { RelTrailerOwnerDTO } from '../../rel-trailer-owner/dtos/rel-trailer-owner.dto';
import { transactionType } from 'src/core/enums/transaction-types';

export class OwnerDTO extends BaseDTO {
  @ApiProperty({ example: 'أحمد محمد علي' })
  @IsString()
  name: string;

  @ApiProperty({ example: '01012345678' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'ahmed@example.com' })
  @IsString()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ example: '123 Main St, Cairo, Egypt' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({ example: 'INSTAPAY' })
  @IsString()
  @IsOptional()
  transactionType: transactionType;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsString()
  @IsOptional()
  paymentNumber: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsString()
  @IsOptional()
  bankAccountNumber: string;

  @ApiPropertyOptional({ example: 'National Bank of Egypt' })
  @IsString()
  @IsOptional()
  bankName: string;

  @ApiPropertyOptional({ example: 'Preferred customer, pays on time' })
  @IsString()
  @IsOptional()
  notes: string;

  // Exactly like carAttachments in CarDTO
  @ApiPropertyOptional({
    description: 'List of car ownership records (rel_car_owners)',
    type: () => RelCarOwnerDTO,
    isArray: true,
  })
  @IsOptional()
  carOwnerships?: RelCarOwnerDTO[];

  @ApiPropertyOptional({
    description: 'List of trailer ownership records (rel_trailer_owners)',
    type: () => RelTrailerOwnerDTO,
    isArray: true,
  })
  @IsOptional()
  trailerOwnerships?: RelTrailerOwnerDTO[];
}
