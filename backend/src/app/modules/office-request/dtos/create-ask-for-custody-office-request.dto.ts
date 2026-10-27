import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Equals, IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { OfficeRequestType } from 'src/core/enums/office-request';

export class CreateAskForCustodyOfficeRequestDTO {
  @ApiProperty({ enum: [OfficeRequestType.ASK_FOR_CUSTODY] })
  @Equals(OfficeRequestType.ASK_FOR_CUSTODY)
  type: OfficeRequestType.ASK_FOR_CUSTODY;

  @ApiProperty({ description: 'Requested custody amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional journey context (not required for custody transfer)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId?: number;
}
