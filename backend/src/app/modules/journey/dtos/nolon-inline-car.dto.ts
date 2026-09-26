import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export class NolonInlineCarDTO {
  @ApiProperty({ example: '9901' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'ن ل ن' })
  @IsString()
  plateLetters: string;

  @ApiProperty({ example: 'LIC-NOLON-CAR-001' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  licenseExpiryDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ enum: VeachleStatus })
  @IsOptional()
  status?: VeachleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  manufactureYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chassisNumber?: string;
}
