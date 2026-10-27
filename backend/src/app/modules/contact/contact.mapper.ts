import { Contact } from './contact.entity';
import { ContactDTO } from './dtos/contact.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CreateContactDTO } from './dtos/create-contact.dto';
import { UpdateContactDTO } from './dtos/update-contact.dto';
import { User } from '../user/user.entity';

/**
 * Defines allowed keys for mapping from Contact entity to DTO.
 * Include all simple scalar fields and metadata fields.
 */
const allowedContactDtoKeys: ReadonlyArray<keyof ContactDTO | keyof BaseDTO> = [
  'id',
  'user',
  'phone',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
];

/**
 * Maps a Contact entity or array of entities to ContactDTO(s),
 * allowing selective inclusion of properties based on allowed keys.
 */
export function mapContactToContactDtoSelective(
  entity: Contact,
  keys?: (keyof ContactDTO | keyof BaseDTO)[],
): UpdateContactDTO;
export function mapContactToContactDtoSelective(
  entities: Contact[],
  keys?: (keyof ContactDTO | keyof BaseDTO)[],
): UpdateContactDTO[];
export function mapContactToContactDtoSelective(
  input: Contact | Contact[],
  keys?: (keyof ContactDTO | keyof BaseDTO)[],
): UpdateContactDTO | UpdateContactDTO[] {
  const mapSingle = (entity: Contact): UpdateContactDTO => {
    const resultDto: UpdateContactDTO = {};

    const keysToMap = (keys || allowedContactDtoKeys).filter((key) =>
      allowedContactDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in entity && entity[key] !== undefined) {
        (resultDto as any)[key] = entity[key];
      }
    });

    return resultDto;
  };

  return Array.isArray(input) ? input.map(mapSingle) : mapSingle(input);
}

/**
 * Maps a CreateContactDTO to a new Contact entity.
 * Used when creating new records before saving to DB.
 */
export function mapCreateContactDtoToEntity(
  dto: CreateContactDTO | CreateContactDTO[],
): Contact | Contact[] {
  const mapSingle = (item: CreateContactDTO): Contact => {
    const contact = new Contact();
    contact.phone = item.phone;
    contact.isPrimary = item.isPrimary ?? false;

    if (item.userId) {
      contact.user = new User();
      contact.user.id = item.userId;
    }

    return contact;
  };

  return Array.isArray(dto) ? dto.map(mapSingle) : mapSingle(dto);
}

/**
 * Maps an UpdateContactDTO to an existing Contact entity.
 * Only defined fields in the DTO will update the entity.
 */
export function mapUpdateContactDtoToEntity(
  dto: UpdateContactDTO | UpdateContactDTO[],
): Contact | Contact[] {
  const mapOne = (item: UpdateContactDTO): Contact => {
    const contact = new Contact();

    if (item.id !== undefined) contact.id = item.id;
    if (item.phone !== undefined) contact.phone = item.phone;
    if (item.isPrimary !== undefined) contact.isPrimary = item.isPrimary;

    return contact;
  };

  if (Array.isArray(dto)) {
    return dto.map(mapOne);
  }

  return mapOne(dto);
}
