import { PhysicalAttachment } from './physical-attachment.entity';
import { CreatePhysicalAttachmentDTO } from './dtos/create-physical-attachment.dto';
import { PhysicalAttachmentDTO } from './dtos/physical-attachment.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdatePhysicalAttachmentDTO } from './dtos/update-physical-attachment.dto';
import { Car } from '../car/car.entity';
import { Trailer } from '../trailer/trailer.entity';

const allowedPhysicalAttachmentDtoKeys: ReadonlyArray<keyof PhysicalAttachmentDTO | keyof BaseDTO> =
  [
    'id',
    'name',
    'date',
    'description',
    'photoUrl',
    'price',
    'confirmedOk',
    'confirmedBy',
    'confirmedAt',
    'car',
    'trailer',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ];

export function mapPhysicalAttachmentToDtoSelective(
  attachment: PhysicalAttachment | PhysicalAttachmentDTO,
  keys?: (keyof PhysicalAttachmentDTO | keyof BaseDTO)[],
): Partial<PhysicalAttachmentDTO>;

export function mapPhysicalAttachmentToDtoSelective(
  attachments: (PhysicalAttachment | PhysicalAttachmentDTO)[],
  keys?: (keyof PhysicalAttachmentDTO | keyof BaseDTO)[],
): Partial<PhysicalAttachmentDTO>[];

export function mapPhysicalAttachmentToDtoSelective(
  attachmentOrAttachments:
    PhysicalAttachment | PhysicalAttachmentDTO | (PhysicalAttachment | PhysicalAttachmentDTO)[],
  keys?: (keyof PhysicalAttachmentDTO | keyof BaseDTO)[],
): Partial<PhysicalAttachmentDTO> | Partial<PhysicalAttachmentDTO>[] {
  const mapSingle = (
    attachment: PhysicalAttachment | PhysicalAttachmentDTO,
  ): Partial<PhysicalAttachmentDTO> => {
    const resultDto: Partial<PhysicalAttachmentDTO> = {};

    const keysToMap = (keys || allowedPhysicalAttachmentDtoKeys).filter((key) =>
      allowedPhysicalAttachmentDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (attachment as any)[key];
      if (value !== undefined) {
        (resultDto as any)[key] = value;
      }
    });

    return resultDto;
  };

  return Array.isArray(attachmentOrAttachments)
    ? attachmentOrAttachments.map(mapSingle)
    : mapSingle(attachmentOrAttachments);
}

export const mapCreatePhysicalAttachmentDtoToEntity = (
  dto: CreatePhysicalAttachmentDTO,
): PhysicalAttachment => {
  const attachment = new PhysicalAttachment();
  if (dto.carId) {
    attachment.car = new Car();
    attachment.car.id = dto.carId;
  }
  if (dto.trailerId) {
    attachment.trailer = new Trailer();
    attachment.trailer.id = dto.trailerId;
  }
  attachment.name = dto.name;
  attachment.date = dto.date;
  attachment.description = dto.description;
  attachment.photoUrl = dto.photoUrl;
  attachment.price = dto.price;
  attachment.createdAt = dto.createdAt;

  return attachment;
};

export const mapUpdatePhysicalAttachmentDtoToEntity = (
  dto: UpdatePhysicalAttachmentDTO,
): PhysicalAttachment => {
  const attachment = new PhysicalAttachment();

  if (dto.id !== undefined) attachment.id = dto.id;
  if (dto.name !== undefined) attachment.name = dto.name;
  if (dto.date !== undefined) attachment.date = dto.date;
  if (dto.description !== undefined) attachment.description = dto.description;
  if (dto.photoUrl !== undefined) attachment.photoUrl = dto.photoUrl;
  if (dto.price !== undefined) attachment.price = dto.price;
  if (dto.confirmedOk !== undefined) attachment.confirmedOk = dto.confirmedOk;
  if (dto.confirmedBy !== undefined) attachment.confirmedBy = dto.confirmedBy;
  if (dto.confirmedAt !== undefined) attachment.confirmedAt = dto.confirmedAt;

  return attachment;
};
