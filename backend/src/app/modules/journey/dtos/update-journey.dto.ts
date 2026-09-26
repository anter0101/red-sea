import { PartialType } from '@nestjs/swagger';
import { CreateJourneyDTO } from './create-journey.dto';

export class UpdateJourneyDTO extends PartialType(CreateJourneyDTO) {}
