// src/owner/dtos/update-owner.dto.ts
import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerDTO } from './owner.dto';
import { IsArray, IsOptional, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { transactionType } from 'src/core/enums/transaction-types';

// Reuse the same input classes from CreateOwnerDTO
class OwnershipInput {
  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  percentage: number;

  @ApiPropertyOptional({ enum: transactionType })
  @IsOptional()
  @IsEnum(transactionType)
  transactionType: transactionType;
}

class CarOwnershipUpdateInput extends OwnershipInput {
  @ApiPropertyOptional({
    example: 15,
    description: 'rel_car_owners.id — required only when updating existing ownership',
  })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ example: 5, description: 'carId — required when creating new ownership' })
  @IsOptional()
  @IsNumber()
  carId: number;
}

class TrailerOwnershipUpdateInput extends OwnershipInput {
  @ApiPropertyOptional({ example: 22 })
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  trailerId: number;
}

export class UpdateOwnerDTO extends PartialType(
  OmitType(OwnerDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'carOwnerships',
    'trailerOwnerships',
  ] as const),
) {
  // Add new or update existing car ownerships
  @ApiPropertyOptional({
    type: [CarOwnershipUpdateInput],
    description:
      'Use `id` to update existing ownership, omit `id` to create new. To delete, send empty array or remove from list.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarOwnershipUpdateInput)
  carOwnerships: CarOwnershipUpdateInput[];

  // Same for trailers
  @ApiPropertyOptional({
    type: [TrailerOwnershipUpdateInput],
    description: 'Same logic as carOwnerships',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrailerOwnershipUpdateInput)
  trailerOwnerships: TrailerOwnershipUpdateInput[];
}
