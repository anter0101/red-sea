import { JourneyAttachment } from './journey-attachment.entity';
import { JourneyAttachmentDTO } from './dtos/journey-attachment.dto';
import { CreateJourneyAttachmentDTO } from './dtos/create-journey-attachment.dto';
import { UpdateJourneyAttachmentDTO } from './dtos/update-journey-attachment.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Journey } from '../journey/journey.entity';
import { JourneyDTO } from '../journey/dtos/journey.dto';

const allowedJourneyAttachmentDtoKeys: ReadonlyArray<keyof JourneyAttachmentDTO | keyof BaseDTO> = [
  'id',
  'type',
  'url',
  'journey',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

export function mapJourneyAttachmentToDtoSelective(
  att: JourneyAttachment,
  keys?: (keyof JourneyAttachmentDTO | keyof BaseDTO)[],
): Partial<JourneyAttachmentDTO>;
export function mapJourneyAttachmentToDtoSelective(
  list: JourneyAttachment[],
  keys?: (keyof JourneyAttachmentDTO | keyof BaseDTO)[],
): Partial<JourneyAttachmentDTO>[];
export function mapJourneyAttachmentToDtoSelective(
  value: JourneyAttachment | JourneyAttachment[],
  keys?: (keyof JourneyAttachmentDTO | keyof BaseDTO)[],
): Partial<JourneyAttachmentDTO> | Partial<JourneyAttachmentDTO>[] {
  const mapSingle = (att: JourneyAttachment): Partial<JourneyAttachmentDTO> => {
    const dto: Partial<JourneyAttachmentDTO> = {};
    const keysToMap = (keys || allowedJourneyAttachmentDtoKeys).filter((key) =>
      allowedJourneyAttachmentDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (att as any)[key];
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });

    return dto;
  };

  return Array.isArray(value) ? value.map(mapSingle) : mapSingle(value);
}

export const mapCreateJourneyAttachmentDtoToEntity = (
  dto: CreateJourneyAttachmentDTO,
): JourneyAttachment => {
  const entity = new JourneyAttachment();
  entity.type = dto.type;
  entity.url = dto.url;
  if (dto.journeyId) entity.journey = { id: dto.journeyId } as Journey;
  return entity;
};

export const mapUpdateJourneyAttachmentDtoToEntity = (
  dto: UpdateJourneyAttachmentDTO,
  existing: JourneyAttachment,
  journey?: JourneyDTO,
): JourneyAttachment => {
  if (dto.type !== undefined) existing.type = dto.type;
  if (dto.url !== undefined) existing.url = dto.url;
  if (journey) existing.journey = { id: journey.id } as Journey;
  return existing;
};
