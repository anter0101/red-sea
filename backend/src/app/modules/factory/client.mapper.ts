import { Client } from './client.entity';
import { ClientDTO } from './dtos/client.dto';
import { CreateClientDTO } from './dtos/create-client.dto';
import { UpdateClientDTO } from './dtos/update-client.dto';
import { BaseDTO } from 'src/core/utils/base.dto';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedClientDtoKeys: ReadonlyArray<keyof ClientDTO | keyof BaseDTO> = [
  'id',
  'name',
  'commercialRecord',
  'taxInvoice',
  'destinationsFile',
  'companyCode',
  'pricingSheetKind',

  // base dto fields
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Client → ClientDTO (single or array)
 */
export function mapClientToClientDtoSelective(
  client: Client,
  keys?: (keyof ClientDTO | keyof BaseDTO)[],
): Partial<ClientDTO>;

export function mapClientToClientDtoSelective(
  clients: Client[],
  keys?: (keyof ClientDTO | keyof BaseDTO)[],
): Partial<ClientDTO>[];

export function mapClientToClientDtoSelective(
  data: Client | Client[],
  keys?: (keyof ClientDTO | keyof BaseDTO)[],
): Partial<ClientDTO> | Partial<ClientDTO>[] {
  const mapSingle = (client: Client): Partial<ClientDTO> => {
    const dto: Partial<ClientDTO> = {};

    const keysToMap = (keys || allowedClientDtoKeys).filter((key) =>
      (allowedClientDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in client && client[key as keyof Client] !== undefined) {
        (dto as any)[key] = client[key as keyof Client];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateClientDtoToEntity = (dto: CreateClientDTO): Client => {
  const entity = new Client();

  entity.name = dto.name;
  entity.commercialRecord = dto.commercialRecord;
  entity.taxInvoice = dto.taxInvoice;
  entity.destinationsFile = dto.destinationsFile;
  entity.pricingSheetKind = dto.pricingSheetKind;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateClientDtoToEntity = (dto: UpdateClientDTO): Client => {
  const entity = new Client();

  if (dto.id !== undefined) entity.id = dto.id;
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.commercialRecord !== undefined) entity.commercialRecord = dto.commercialRecord;
  if (dto.taxInvoice !== undefined) entity.taxInvoice = dto.taxInvoice;
  if (dto.destinationsFile !== undefined) entity.destinationsFile = dto.destinationsFile;
  if (dto.pricingSheetKind !== undefined) entity.pricingSheetKind = dto.pricingSheetKind;

  if (dto.createdAt !== undefined) entity.createdAt = dto.createdAt;

  return entity;
};
