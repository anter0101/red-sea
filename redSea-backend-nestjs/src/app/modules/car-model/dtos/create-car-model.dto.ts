import { IsInt, IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CarModelDTO } from './car-model.dto';

export class CreateCarModelDTO extends OmitType(CarModelDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'manufacturer',
] as const) {
  @IsString()
  name: string;

  @IsInt()
  manufacturerId: number;
}
