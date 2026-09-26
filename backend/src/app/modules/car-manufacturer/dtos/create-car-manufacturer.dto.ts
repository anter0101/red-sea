import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CarManufacturerDTO } from './car-manufacturer.dto';

export class CreateCarManufacturerDTO extends OmitType(CarManufacturerDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'carModels',
] as const) {
  @IsString()
  name: string;
}
