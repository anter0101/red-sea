import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { TireModelDTO } from './tire-model.dto';

export class CreateTireModelDTO extends OmitType(TireModelDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
] as const) {
  @IsString()
  name: string;
}
