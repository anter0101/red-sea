import { ApiProperty } from '@nestjs/swagger';
import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';

export class JourneyDelegationPrintDTO {
  @ApiProperty()
  journeyId: number;

  @ApiProperty({ enum: JourneyDelegationPrintStatus })
  status: JourneyDelegationPrintStatus;

  @ApiProperty({ description: 'True when delegation document still needs printing' })
  canPrint: boolean;
}
