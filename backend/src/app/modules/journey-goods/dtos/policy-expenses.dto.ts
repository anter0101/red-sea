import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PolicyExpensesDTO {
  @ApiPropertyOptional({ description: 'سولار', example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dieselFees?: number;

  @ApiPropertyOptional({ description: 'عدد لترات السولار', example: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fuelLiters?: number;

  @ApiPropertyOptional({ description: 'كارته', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cardFees?: number;

  @ApiPropertyOptional({ description: 'اسم الكارته' })
  @IsOptional()
  @IsString()
  cardName?: string;

  @ApiPropertyOptional({ description: 'ميزان', example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  scaleFees?: number;

  @ApiPropertyOptional({ description: 'اكراميات', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tipsFees?: number;
}
