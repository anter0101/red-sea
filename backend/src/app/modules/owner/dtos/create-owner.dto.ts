// src/owner/dtos/create-owner.dto.ts
import { OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerDTO } from './owner.dto';
import { IsArray, IsOptional, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { transactionType } from 'src/core/enums/transaction-types';

class OwnershipInput {
  @ApiPropertyOptional({ example: 75.5, description: 'Ownership percentage (0.00 - 100.00)' })
  @IsNumber()
  percentage: number;
}

class CarOwnershipInput extends OwnershipInput {
  @ApiPropertyOptional({ example: 5, description: 'Car ID to assign ownership' })
  @IsNumber()
  carId: number;
}

class TrailerOwnershipInput extends OwnershipInput {
  @ApiPropertyOptional({ example: 3, description: 'Trailer ID to assign ownership' })
  @IsNumber()
  trailerId: number;
}

export class CreateOwnerDTO extends OmitType(OwnerDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'carOwnerships',
  'trailerOwnerships',
] as const) {
  @ApiPropertyOptional({
    type: [CarOwnershipInput],
    description: 'List of cars this owner owns with percentage and payment method',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarOwnershipInput)
  carOwnerships?: CarOwnershipInput[];

  @ApiPropertyOptional({
    type: [TrailerOwnershipInput],
    description: 'List of trailers this owner owns',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrailerOwnershipInput)
  trailerOwnerships?: TrailerOwnershipInput[];
  @ApiPropertyOptional({ enum: transactionType, example: 'CASH' })
  @IsEnum(transactionType)
  transactionType: transactionType;
}
