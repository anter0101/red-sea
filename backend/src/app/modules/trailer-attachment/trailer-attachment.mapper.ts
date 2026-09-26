// src/trailer-attachment/trailer-attachment.mapper.ts
import { TrailerAttachment } from './trailer-attachment.entity';
import { TrailerAttachmentDTO } from './dtos/trailer-attachment.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CreateTrailerAttachmentDTO } from './dtos/create-trailer-attachment.dto';
import { UpdateTrailerAttachmentDTO } from './dtos/update-trailer-attachment.dto';
import { Trailer } from '../trailer/trailer.entity';

const allowedTrailerAttachmentDtoKeys: ReadonlyArray<keyof TrailerAttachmentDTO | keyof BaseDTO> = [
  'id',
  'trailer',
  'type',
  'documentExpiryDate',
  'url',
  'notes',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapTrailerAttachmentToDtoSelective(
  attachment: TrailerAttachment,
  keys?: (keyof TrailerAttachmentDTO | keyof BaseDTO)[],
): Partial<TrailerAttachmentDTO>;
export function mapTrailerAttachmentToDtoSelective(
  attachments: TrailerAttachment[],
  keys?: (keyof TrailerAttachmentDTO | keyof BaseDTO)[],
): Partial<TrailerAttachmentDTO>[];
export function mapTrailerAttachmentToDtoSelective(
  attachmentOrAttachments: TrailerAttachment | TrailerAttachment[],
  keys?: (keyof TrailerAttachmentDTO | keyof BaseDTO)[],
): Partial<TrailerAttachmentDTO> | Partial<TrailerAttachmentDTO>[] {
  const mapSingle = (attachment: TrailerAttachment): Partial<TrailerAttachmentDTO> => {
    const resultDto: Partial<TrailerAttachmentDTO> = {};

    const keysToMap = (keys || allowedTrailerAttachmentDtoKeys).filter((key) =>
      allowedTrailerAttachmentDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in attachment && attachment[key as keyof TrailerAttachment] !== undefined) {
        (resultDto as any)[key] = attachment[key as keyof TrailerAttachment];
      }
    });

    return resultDto;
  };

  return Array.isArray(attachmentOrAttachments)
    ? attachmentOrAttachments.map(mapSingle)
    : mapSingle(attachmentOrAttachments);
}

export const mapCreateTrailerAttachmentDtoToEntity = (
  dto: CreateTrailerAttachmentDTO,
): TrailerAttachment => {
  const attachment = new TrailerAttachment();
  if (dto.trailerId) {
    attachment.trailer = new Trailer();
    attachment.trailer.id = dto.trailerId;
  }
  attachment.type = dto.type;
  attachment.documentExpiryDate = dto.documentExpiryDate;
  attachment.url = dto.url;
  attachment.notes = dto.notes;

  return attachment;
};

export const mapUpdateTrailerAttachmentDtoToEntity = (
  dto: UpdateTrailerAttachmentDTO,
): TrailerAttachment => {
  const attachment = new TrailerAttachment();

  if (dto.id !== undefined) attachment.id = dto.id;
  if (dto.type !== undefined) attachment.type = dto.type;
  if (dto.documentExpiryDate !== undefined) attachment.documentExpiryDate = dto.documentExpiryDate;
  if (dto.url !== undefined) attachment.url = dto.url;
  if (dto.notes !== undefined) attachment.notes = dto.notes;

  return attachment;
};
