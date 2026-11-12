import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateJourneyPolicyDTO } from './create-journey-policy.dto';

// DTO used for loading policy data into forms (create/update shape + id)
export class JourneyPolicyFormDTO extends CreateJourneyPolicyDTO {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Expense categories already settled from the driver custody (TRN3)',
  })
  postedExpenses?: string[];
}
