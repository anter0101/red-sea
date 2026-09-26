import { CarAttachment } from './car-attachment.entity';
import { CreateCarAttachmentDTO } from './dtos/create-car-attachment.dto';
import { CarAttachmentDTO } from './dtos/car-attachment.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateCarAttachmentDTO } from './dtos/update-car-attachment.dto';
import { Car } from '../car/car.entity';

const allowedCarAttachmentDtoKeys: ReadonlyArray<keyof CarAttachmentDTO | keyof BaseDTO> = [
  'id',
  'car',
  'type',
  'documentExpiryDate',
  'url',
  'notes',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapCarAttachmentToDtoSelective(
  attachment: CarAttachment | CarAttachmentDTO,
  keys?: (keyof CarAttachmentDTO | keyof BaseDTO)[],
): Partial<CarAttachmentDTO>;

export function mapCarAttachmentToDtoSelective(
  attachments: (CarAttachment | CarAttachmentDTO)[],
  keys?: (keyof CarAttachmentDTO | keyof BaseDTO)[],
): Partial<CarAttachmentDTO>[];

export function mapCarAttachmentToDtoSelective(
  attachmentOrAttachments: CarAttachment | CarAttachmentDTO | (CarAttachment | CarAttachmentDTO)[],
  keys?: (keyof CarAttachmentDTO | keyof BaseDTO)[],
): Partial<CarAttachmentDTO> | Partial<CarAttachmentDTO>[] {
  const mapSingle = (attachment: CarAttachment | CarAttachmentDTO): Partial<CarAttachmentDTO> => {
    const resultDto: Partial<CarAttachmentDTO> = {};

    const keysToMap = (keys || allowedCarAttachmentDtoKeys).filter((key) =>
      allowedCarAttachmentDtoKeys.includes(key),
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

export const mapCreateCarAttachmentDtoToEntity = (dto: CreateCarAttachmentDTO): CarAttachment => {
  const attachment = new CarAttachment();
  if (dto.carId) {
    attachment.car = new Car();
    attachment.car.id = dto.carId;
  }
  attachment.type = dto.type;
  attachment.documentExpiryDate = dto.documentExpiryDate;
  attachment.url = dto.url;
  attachment.notes = dto.notes;
  attachment.createdAt = dto.createdAt;

  return attachment;
};

export const mapUpdateCarAttachmentDtoToEntity = (dto: UpdateCarAttachmentDTO): CarAttachment => {
  const attachment = new CarAttachment();

  if (dto.id !== undefined) attachment.id = dto.id;
  if (dto.type !== undefined) attachment.type = dto.type;
  if (dto.documentExpiryDate !== undefined) attachment.documentExpiryDate = dto.documentExpiryDate;
  if (dto.url !== undefined) attachment.url = dto.url;
  if (dto.notes !== undefined) attachment.notes = dto.notes;

  return attachment;
};
