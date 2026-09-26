import { OmitType } from '@nestjs/swagger';
import { AreaDTO } from './area.dto';

export class CreateAreaDTO extends OmitType(AreaDTO, ['id', 'updatedAt', 'government'] as const) {
  governmentId: number;
}
