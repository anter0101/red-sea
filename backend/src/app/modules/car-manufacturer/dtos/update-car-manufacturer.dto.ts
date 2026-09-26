import { PartialType, OmitType } from '@nestjs/swagger';
import { CarManufacturerDTO } from './car-manufacturer.dto';

export class UpdateCarManufacturerDTO extends PartialType(
  OmitType(CarManufacturerDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'carModels',
  ] as const),
) {}
