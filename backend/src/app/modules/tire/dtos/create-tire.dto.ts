// src/tire/dtos/create-tire.dto.ts
import { OmitType, ApiProperty } from '@nestjs/swagger';
import { TireDTO } from './tire.dto';

export class CreateTireDTO extends OmitType(TireDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'axle',
] as const) {
  @ApiProperty({
    description: 'ID of the axle this tire will be attached to',
    required: false,
  })
  axleId?: number;
}
