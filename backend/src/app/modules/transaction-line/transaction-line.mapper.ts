import { TransactionLine } from './transaction-line.entity';
import { TransactionLineDTO } from './dtos/transaction-line.dto';
import { CreateTransactionLineDTO } from './dtos/create-transaction-line.dto';
import { UpdateTransactionLineDTO } from './dtos/update-transaction-line.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { Account } from '../account/account.entity';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedTransactionLineDtoKeys: ReadonlyArray<keyof TransactionLineDTO | keyof BaseDTO> = [
  'id',
  'account',
  'entryType',
  'amount',
  'description',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps TransactionLine → TransactionLineDTO (single or array)
 */
export function mapTransactionLineToTransactionLineDtoSelective(
  line: TransactionLine,
  keys?: (keyof TransactionLineDTO | keyof BaseDTO)[],
): Partial<TransactionLineDTO>;

export function mapTransactionLineToTransactionLineDtoSelective(
  lines: TransactionLine[],
  keys?: (keyof TransactionLineDTO | keyof BaseDTO)[],
): Partial<TransactionLineDTO>[];

export function mapTransactionLineToTransactionLineDtoSelective(
  data: TransactionLine | TransactionLine[],
  keys?: (keyof TransactionLineDTO | keyof BaseDTO)[],
): Partial<TransactionLineDTO> | Partial<TransactionLineDTO>[] {
  const mapSingle = (line: TransactionLine): Partial<TransactionLineDTO> => {
    const dto: Partial<TransactionLineDTO> = {};

    const keysToMap = (keys || allowedTransactionLineDtoKeys).filter((key) =>
      (allowedTransactionLineDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in line) {
        dto[key] = line[key as keyof TransactionLine] as any;
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateTransactionLineDtoToEntity = (
  dto: CreateTransactionLineDTO,
): TransactionLine => {
  const entity = new TransactionLine();

  const account = new Account();
  account.id = dto.accountId;
  entity.account = account;

  entity.entryType = dto.entryType;
  entity.amount = dto.amount;
  entity.description = dto.description;

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateTransactionLineDtoToEntity = (
  dto: UpdateTransactionLineDTO,
  existing: TransactionLine,
): TransactionLine => {
  if (dto.entryType !== undefined) existing.entryType = dto.entryType;
  if (dto.amount !== undefined) existing.amount = dto.amount;
  if (dto.description !== undefined) existing.description = dto.description;

  if (dto.accountId !== undefined) {
    const account = new Account();
    account.id = dto.accountId;
    existing.account = account;
  }

  return existing;
};
