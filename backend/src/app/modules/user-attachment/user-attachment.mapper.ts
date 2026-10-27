import { UserAttachment } from './user-attachment.entity';
import { CreateUserAttachmentDTO } from './dtos/create-user-attachment.dto';
import { UserAttachmentDTO } from './dtos/user-attachment.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateUserAttachmentDTO } from './dtos/update-user-attachment.dto';
import { User } from '../user/user.entity';

const allowedUserAttachmentDtoKeys: ReadonlyArray<keyof UserAttachmentDTO | keyof BaseDTO> = [
  'id',
  'user',
  'url',
  'type',
  'notes',
  'documentExpiryDate',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
];

export function mapUserAttachmentToDtoSelective(
  attachment: UserAttachment | UserAttachmentDTO,
  keys?: (keyof UserAttachmentDTO | keyof BaseDTO)[],
): Partial<UserAttachmentDTO>;

export function mapUserAttachmentToDtoSelective(
  attachments: (UserAttachment | UserAttachmentDTO)[],
  keys?: (keyof UserAttachmentDTO | keyof BaseDTO)[],
): Partial<UserAttachmentDTO>[];

export function mapUserAttachmentToDtoSelective(
  attachmentOrAttachments:
    UserAttachment | UserAttachmentDTO | (UserAttachment | UserAttachmentDTO)[],
  keys?: (keyof UserAttachmentDTO | keyof BaseDTO)[],
): Partial<UserAttachmentDTO> | Partial<UserAttachmentDTO>[] {
  const mapSingle = (
    attachment: UserAttachment | UserAttachmentDTO,
  ): Partial<UserAttachmentDTO> => {
    const resultDto: Partial<UserAttachmentDTO> = {};

    const keysToMap = (keys || allowedUserAttachmentDtoKeys).filter((key) =>
      allowedUserAttachmentDtoKeys.includes(key),
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

export const mapCreateUserAttachmentDtoToEntity = (
  dto: CreateUserAttachmentDTO,
): UserAttachment => {
  const attachment = new UserAttachment();

  if (dto.userId) {
    attachment.user = new User();
    attachment.user.id = dto.userId;
  }

  attachment.url = dto.url;
  attachment.type = dto.type;
  attachment.notes = dto.notes;
  attachment.documentExpiryDate = dto.documentExpiryDate;
  attachment.createdAt = dto.createdAt;

  return attachment;
};

export const mapUpdateUserAttachmentDtoToEntity = (
  dto: UpdateUserAttachmentDTO,
): UserAttachment => {
  const attachment = new UserAttachment();

  if (dto.id !== undefined) attachment.id = dto.id;
  if (dto.url !== undefined) attachment.url = dto.url;
  if (dto.type !== undefined) attachment.type = dto.type;
  if (dto.notes !== undefined) attachment.notes = dto.notes;
  if (dto.documentExpiryDate !== undefined) attachment.documentExpiryDate = dto.documentExpiryDate;

  return attachment;
};
