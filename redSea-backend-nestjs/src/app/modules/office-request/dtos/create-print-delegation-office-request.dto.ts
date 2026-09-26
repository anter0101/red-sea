import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Equals, IsInt, IsPositive } from 'class-validator';
import { OfficeRequestType } from 'src/core/enums/office-request';

export class CreatePrintDelegationOfficeRequestDTO {
  @ApiProperty({ enum: [OfficeRequestType.PRINT_DELEGATION] })
  @Equals(OfficeRequestType.PRINT_DELEGATION)
  type: OfficeRequestType.PRINT_DELEGATION;

  @ApiProperty({ description: 'Journey to request delegation print reset for' })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId: number;
}
