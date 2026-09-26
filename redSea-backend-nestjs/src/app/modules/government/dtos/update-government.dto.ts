import { PartialType } from '@nestjs/swagger';
import { GovernmentDTO } from './government.dto';

export class UpdateGovernmentDTO extends PartialType(GovernmentDTO) {}
