import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OwnerDto {
  @ApiProperty({ example: 1, description: 'ID of the owner to assign' })
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({
    example: 75.5,
    description: 'Ownership percentage (0.00 - 100.00)',
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
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
}

export class BulkAssignOwnerDTO {
  @ApiProperty({ example: 1, description: 'ID of the car to assign' })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  carId: number;

  @ApiProperty({ example: 1, description: 'ID of the trailer to assign' })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  trailerId: number;

  @ApiProperty({ type: [OwnerDto], description: 'List of owners to assign' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OwnerDto)
  owners: OwnerDto[];
}
