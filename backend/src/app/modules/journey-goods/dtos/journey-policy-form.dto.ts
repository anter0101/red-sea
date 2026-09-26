import { ApiProperty } from '@nestjs/swagger';
import { CreateJourneyPolicyDTO } from './create-journey-policy.dto';

// DTO used for loading policy data into forms (create/update shape + id)
export class JourneyPolicyFormDTO extends CreateJourneyPolicyDTO {
  @ApiProperty()
  id: number;
}
