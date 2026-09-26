import { OmitType, ApiProperty } from '@nestjs/swagger';
import { AxleDTO } from './axle.dto';
import { CreateTireDTO } from '../../tire/dtos/create-tire.dto';

export class CreateAxleDTO extends OmitType(AxleDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'car',
  'trailer',
  'tires',
] as const) {
  @ApiProperty({ description: 'Car ID if the axle belongs to a car', required: false })
  carId?: number;

  @ApiProperty({ description: 'Trailer ID if the axle belongs to a trailer', required: false })
  trailerId?: number;

  @ApiProperty({
    description: 'Tires to create and attach to this axle',
    type: () => [CreateTireDTO],
    required: false,
  })
  tires?: CreateTireDTO[];
}
