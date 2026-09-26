import { PartialType, OmitType } from '@nestjs/swagger';
import { TireModelDTO } from './tire-model.dto';

export class UpdateTireModelDTO extends PartialType(
  OmitType(TireModelDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
  ] as const),
) {}
