import { PartialType, OmitType } from '@nestjs/swagger';
import { CarDTO } from './car.dto';

export class UpdateCarDTO extends PartialType(
  OmitType(CarDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
  ] as const),
) {}
