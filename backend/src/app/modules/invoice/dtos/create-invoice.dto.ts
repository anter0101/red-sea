import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, Max, Min } from 'class-validator';

const PERCENT_MESSAGE = 'النسبة لازم تكون بين 0 و 100';

export class CreateInvoiceDTO {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  clientId: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1, { message: 'اختار رحلة واحدة على الأقل' })
  @Type(() => Number)
  @IsInt({ each: true })
  journeyIds: number[];

  @ApiProperty()
  @IsBoolean()
  taxEnabled: boolean;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: PERCENT_MESSAGE })
  @Max(100, { message: PERCENT_MESSAGE })
  vatPercentage: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: PERCENT_MESSAGE })
  @Max(100, { message: PERCENT_MESSAGE })
  withholdingPercentage: number;
}
