import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { TrailerManufacturerDTO } from './trailer-manufacturer.dto';

export class CreateTrailerManufacturerDTO extends OmitType(TrailerManufacturerDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  // 'trailerModels', // Uncomment if trailerModels is used
] as const) {
  @IsString()
  name: string;
}
