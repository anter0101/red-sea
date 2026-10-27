import { ApiProperty } from '@nestjs/swagger';
import { JourneyDelegationPrintStatus } from 'src/core/enums/journey-delegation-print';

export class JourneyDelegationPrintDTO {
  @ApiProperty()
  journeyId: number;

  @ApiProperty({ required: false })
  delegateNumber?: string;

  @ApiProperty({ enum: JourneyDelegationPrintStatus })
  status: JourneyDelegationPrintStatus;

  @ApiProperty({
    description:
      'True only after an admin approved a print request and the journey still has no policy',
  })
  canPrint: boolean;
}
