import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export class NolonInlineTrailerDTO {
  @ApiProperty({ example: '9902' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'م ق ط' })
  @IsString()
  plateLetters: string;

  @ApiProperty({ example: 'LIC-NOLON-TRL-001' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2027-06-01' })
  @IsDateString()
  licenseExpiryDate: string;

  @ApiPropertyOptional({ example: 25, description: 'Max weight in tons' })
  @IsOptional()
  @IsInt()
  maxWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ enum: VeachleStatus })
  @IsOptional()
  status?: VeachleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chaseType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  manufactureYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}
