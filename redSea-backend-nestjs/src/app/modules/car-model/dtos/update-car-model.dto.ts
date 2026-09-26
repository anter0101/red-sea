import { PartialType, OmitType } from '@nestjs/swagger';
import { CarModelDTO } from './car-model.dto';

export class UpdateCarModelDTO extends PartialType(
  OmitType(CarModelDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'manufacturer',
  ] as const),
) {}
