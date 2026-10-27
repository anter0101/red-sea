import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Equals, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { OfficeRequestType } from 'src/core/enums/office-request';

export class CreateEndWorkingShiftOfficeRequestDTO {
  @ApiProperty({ enum: [OfficeRequestType.END_WORKING_SHIFT] })
  @Equals(OfficeRequestType.END_WORKING_SHIFT)
  type: OfficeRequestType.END_WORKING_SHIFT;

  @ApiPropertyOptional({
    description: 'Optional note for the request',
    example: 'Request to end working shift',
  })
  @IsOptional()
  @IsString()
  note?: string;
  @ApiPropertyOptional({
    description: 'Optional journey context (not required for custody transfer)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId?: number;
}
