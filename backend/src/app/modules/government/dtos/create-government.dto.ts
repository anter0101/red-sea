import { OmitType } from '@nestjs/swagger';
import { GovernmentDTO } from './government.dto';

export class CreateGovernmentDTO extends OmitType(GovernmentDTO, ['id', 'updatedAt'] as const) {}
