import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { normalizeJourneyAssetAssignment } from '../journey-nolon-inline.util';
import { NolonInlineDriverDTO } from './nolon-inline-driver.dto';
import { NolonInlineCarDTO } from './nolon-inline-car.dto';
import { NolonInlineTrailerDTO } from './nolon-inline-trailer.dto';

function transformAssignment<T extends { id?: number; create?: unknown }>(
  value: unknown,
  AssignmentCtor: new () => T,
  CreateCtor: new () => object,
): T | unknown {
  const normalized = normalizeJourneyAssetAssignment(value);
  if (!normalized) return value;

  const dto = new AssignmentCtor();
  if (normalized.id != null) {
    dto.id = normalized.id;
    return dto;
  }
  if (normalized.create != null) {
    dto.create = plainToInstance(CreateCtor, normalized.create) as T['create'];
  }
  return dto;
}

/** Select `{ "id": 1 }` or inline NOLON payload (no `create` wrapper). */
export class JourneyDriverAssignmentDTO {
  @ApiPropertyOptional({ description: 'Existing driver id' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @ApiPropertyOptional({
    description:
      'NOLON inline: `{ user: { firstName, lastName, nationalId, phoneNumber } }` — phone → Contact entity',
  })
  @ValidateIf((o) => o.id == null)
  @IsOptional()
  @ValidateNested()
  @Type(() => NolonInlineDriverDTO)
  create?: NolonInlineDriverDTO;

  static fromPlain(value: unknown): JourneyDriverAssignmentDTO {
    return transformAssignment(
      value,
      JourneyDriverAssignmentDTO,
      NolonInlineDriverDTO,
    ) as JourneyDriverAssignmentDTO;
  }
}

export class JourneyCarAssignmentDTO {
  @ApiPropertyOptional({ description: 'Existing car id' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @ApiPropertyOptional({ description: 'NOLON inline car (plateNumber, plateLetters, …)' })
  @ValidateIf((o) => o.id == null)
  @IsOptional()
  @ValidateNested()
  @Type(() => NolonInlineCarDTO)
  create?: NolonInlineCarDTO;

  static fromPlain(value: unknown): JourneyCarAssignmentDTO {
    return transformAssignment(
      value,
      JourneyCarAssignmentDTO,
      NolonInlineCarDTO,
    ) as JourneyCarAssignmentDTO;
  }
}

export class JourneyTrailerAssignmentDTO {
  @ApiPropertyOptional({ description: 'Existing trailer id' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @ApiPropertyOptional({ description: 'NOLON inline trailer fields' })
  @ValidateIf((o) => o.id == null)
  @IsOptional()
  @ValidateNested()
  @Type(() => NolonInlineTrailerDTO)
  create?: NolonInlineTrailerDTO;

  static fromPlain(value: unknown): JourneyTrailerAssignmentDTO {
    return transformAssignment(
      value,
      JourneyTrailerAssignmentDTO,
      NolonInlineTrailerDTO,
    ) as JourneyTrailerAssignmentDTO;
  }
}

export function transformJourneyAssetAssignment(value: unknown) {
  return normalizeJourneyAssetAssignment(value);
}

export const transformDriverAssignment = ({ value }: { value: unknown }) =>
  transformAssignment(value, JourneyDriverAssignmentDTO, NolonInlineDriverDTO);

export const transformCarAssignment = ({ value }: { value: unknown }) =>
  transformAssignment(value, JourneyCarAssignmentDTO, NolonInlineCarDTO);

export const transformTrailerAssignment = ({ value }: { value: unknown }) =>
  transformAssignment(value, JourneyTrailerAssignmentDTO, NolonInlineTrailerDTO);
