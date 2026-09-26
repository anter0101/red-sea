// src/owner/dtos/rel-trailer-owner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';

export class RelTrailerOwnerDTO extends BaseDTO {
  @ApiProperty({
    example: 100.0,
    description: 'Ownership percentage (0.00 - 100.00)',
  })
  @IsNumber()
  percentage: number;

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

  @ApiProperty({
    type: () => TrailerDTO,
    description: 'The trailer being owned',
  })
  trailer: TrailerDTO;
}
