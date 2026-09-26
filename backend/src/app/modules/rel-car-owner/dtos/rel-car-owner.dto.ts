// src/owner/dtos/rel-car-owner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CarDTO } from '../../car/dtos/car.dto';

export class RelCarOwnerDTO extends BaseDTO {
  @ApiProperty({ example: 75.5, description: 'Ownership percentage (0.00 - 100.00)' })
  @IsNumber()
  percentage: number;

  @ApiProperty({ type: () => CarDTO, description: 'The car being owned' })
  car: CarDTO;

  @ApiProperty({
    example: 'http://example.com/contract.pdf',
    description: 'Ownership contract URL',
  })
  @IsString()
  @IsOptional()
  contractUrl: string;

  @ApiProperty({
    example: 'Additional notes about ownership',
    description: 'Additional notes about ownership',
  })
  @IsString()
  @IsOptional()
  notes: string;
}
