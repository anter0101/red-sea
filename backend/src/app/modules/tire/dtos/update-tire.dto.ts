// src/tire/dtos/update-tire.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { TireDTO } from './tire.dto';

export class UpdateTireDTO extends PartialType(
  OmitType(TireDTO, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
  ] as const),
) {}
