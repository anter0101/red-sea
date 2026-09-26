import { JourneyTransaction } from './journey-transaction.entity';
import { JourneyTransactionDTO } from './dtos/journey-transaction.dto';
import { CreateJourneyTransactionDTO } from './dtos/create-journey-transaction.dto';
import { UpdateJourneyTransactionDTO } from './dtos/update-journey-transaction.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Journey } from '../journey/journey.entity';
import { JourneyDTO } from '../journey/dtos/journey.dto';

const allowedJourneyTransactionDtoKeys: ReadonlyArray<keyof JourneyTransactionDTO | keyof BaseDTO> =
  [
    'id',
    'transactionType',
    'category',
    'amount',
    'quantity',
    'unitPrice',
    'placeOrService',
    'invoiceUrl',
    'description',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
  ];

export function mapJourneyTransactionToDtoSelective(
  tx: JourneyTransaction,
  keys?: (keyof JourneyTransactionDTO | keyof BaseDTO)[],
): Partial<JourneyTransactionDTO>;
export function mapJourneyTransactionToDtoSelective(
  list: JourneyTransaction[],
  keys?: (keyof JourneyTransactionDTO | keyof BaseDTO)[],
): Partial<JourneyTransactionDTO>[];
export function mapJourneyTransactionToDtoSelective(
  value: JourneyTransaction | JourneyTransaction[],
  keys?: (keyof JourneyTransactionDTO | keyof BaseDTO)[],
): Partial<JourneyTransactionDTO> | Partial<JourneyTransactionDTO>[] {
  const mapSingle = (tx: JourneyTransaction): Partial<JourneyTransactionDTO> => {
    const dto: Partial<JourneyTransactionDTO> = {};
    const keysToMap = (keys || allowedJourneyTransactionDtoKeys).filter((key) =>
      allowedJourneyTransactionDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      const value = (tx as any)[key];
      if (value !== undefined) {
        (dto as any)[key] = value;
      }
    });

    return dto;
  };

  return Array.isArray(value) ? value.map(mapSingle) : mapSingle(value);
}

export const mapCreateJourneyTransactionDtoToEntity = (
  dto: CreateJourneyTransactionDTO,
): JourneyTransaction => {
  const entity = new JourneyTransaction();
  entity.transactionType = dto.transactionType;
  entity.category = dto.category;
  entity.amount = dto.amount;
  entity.quantity = dto.quantity;
  entity.unitPrice = dto.unitPrice;
  entity.placeOrService = dto.placeOrService;
  entity.invoiceUrl = dto.invoiceUrl;
  entity.description = dto.description;

  if (dto.journeyId) entity.journey = { id: dto.journeyId } as Journey;

  return entity;
};

export const mapCreateJourneyTransactionDtosToEntities = (
  dtos: CreateJourneyTransactionDTO[],
): JourneyTransaction[] => {
  return dtos.map((dto) => mapCreateJourneyTransactionDtoToEntity(dto));
};
export const mapUpdateJourneyTransactionDtoToEntity = (
  dto: UpdateJourneyTransactionDTO,
  existing: JourneyTransaction,
  journey?: JourneyDTO,
): JourneyTransaction => {
  if (dto.amount !== undefined) existing.amount = dto.amount;
  if (dto.quantity !== undefined) existing.quantity = dto.quantity;
  if (dto.unitPrice !== undefined) existing.unitPrice = dto.unitPrice;
  if (dto.placeOrService !== undefined) existing.placeOrService = dto.placeOrService;
  if (dto.invoiceUrl !== undefined) existing.invoiceUrl = dto.invoiceUrl;
  if (dto.description !== undefined) existing.description = dto.description;

  if (journey !== undefined) {
    existing.journey = { id: journey.id } as Journey;
  }
  return existing;
};
