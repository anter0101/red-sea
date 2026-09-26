// src/journey-policy/dtos/update-journey-policy.dto.ts
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateJourneyPolicyDTO } from './create-journey-policy.dto';

// For updates, we identify the policy by :id in the route,
// so journeyId does not need to be in the body.
export class UpdateJourneyPolicyDTO extends PartialType(
  OmitType(CreateJourneyPolicyDTO, ['journeyId'] as const),
) {}
