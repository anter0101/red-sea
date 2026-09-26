import { Transaction } from './transaction.entity';
import { TransactionDTO } from './dtos/transaction.dto';
import { CreateTransactionDTO } from './dtos/create-transaction.dto';
import { UpdateTransactionDTO } from './dtos/update-transaction.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { TransactionLine } from '../transaction-line/transaction-line.entity';
import { Account } from '../account/account.entity';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedTransactionDtoKeys: ReadonlyArray<keyof TransactionDTO | keyof BaseDTO> = [
  'id',
  'date',
  'code',
  'description',
  'status',
  'transactionLines',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Transaction → TransactionDTO (single or array)
 */
export function mapTransactionToTransactionDtoSelective(
  transaction: Transaction,
  keys?: (keyof TransactionDTO | keyof BaseDTO)[],
): Partial<TransactionDTO>;

export function mapTransactionToTransactionDtoSelective(
  transactions: Transaction[],
  keys?: (keyof TransactionDTO | keyof BaseDTO)[],
): Partial<TransactionDTO>[];

export function mapTransactionToTransactionDtoSelective(
  data: Transaction | Transaction[],
  keys?: (keyof TransactionDTO | keyof BaseDTO)[],
): Partial<TransactionDTO> | Partial<TransactionDTO>[] {
  const mapSingle = (transaction: Transaction): Partial<TransactionDTO> => {
    const dto: Partial<TransactionDTO> = {};

    const keysToMap = (keys || allowedTransactionDtoKeys).filter((key) =>
      (allowedTransactionDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in transaction) {
        dto[key as keyof TransactionDTO] = transaction[key as keyof Transaction] as any;
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateTransactionDtoToEntity = (dto: CreateTransactionDTO): Transaction => {
  const entity = new Transaction();

  entity.date = dto.date;
  entity.description = dto.description;
  entity.status = dto.status;

  // Map transaction lines
  if (dto.transactionLines && dto.transactionLines.length > 0) {
    entity.transactionLines = dto.transactionLines.map((lineDto) => {
      const transactionLine = new TransactionLine();
      const account = new Account();
      account.id = lineDto.accountId;
      transactionLine.account = account;
      transactionLine.entryType = lineDto.entryType;
      transactionLine.amount = lineDto.amount ?? 0;

      if (lineDto.description) {
        transactionLine.description = lineDto.description;
      } else {
        // Fallback to the main transaction's description
        transactionLine.description = dto.description;
      }

      return transactionLine;
    });
  }

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateTransactionDtoToEntity = (
  dto: UpdateTransactionDTO,
  existing: Transaction,
): Transaction => {
  if (dto.date !== undefined) existing.date = dto.date;
  if (dto.description !== undefined) existing.description = dto.description;
  if (dto.status !== undefined) existing.status = dto.status;

  return existing;
};
