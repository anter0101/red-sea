import { OmitType, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import { CreateJourneyDTO } from '../../journey/dtos/create-journey.dto';
import { CreateJourneyPolicyDTO } from './create-journey-policy.dto';

/** Policy fields for a policy created together with its journey (journeyId is set by the server). */
export class CreateJourneyPolicyForNewJourneyDTO extends OmitType(CreateJourneyPolicyDTO, [
  'journeyId',
] as const) {}

export class CreateJourneyWithPolicyDTO {
  @ApiProperty({ type: () => CreateJourneyDTO, description: 'Journey details (office delegation)' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateJourneyDTO)
  journey: CreateJourneyDTO;

  @ApiProperty({ type: () => CreateJourneyPolicyForNewJourneyDTO, description: 'Policy details' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateJourneyPolicyForNewJourneyDTO)
  policy: CreateJourneyPolicyForNewJourneyDTO;
}
