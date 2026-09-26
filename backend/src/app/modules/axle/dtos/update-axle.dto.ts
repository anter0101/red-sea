import { OmitType, PartialType } from '@nestjs/swagger';
import { AxleDTO } from './axle.dto';

export class UpdateAxleDTO extends PartialType(
  OmitType(AxleDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
  ] as const),
) {}
