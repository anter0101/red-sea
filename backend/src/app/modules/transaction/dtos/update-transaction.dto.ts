import { PartialType, OmitType } from '@nestjs/swagger';
import { TransactionDTO } from './transaction.dto';

export class UpdateTransactionDTO extends PartialType(
  OmitType(TransactionDTO, [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'createdBy',
    'updatedBy',
    'deletedBy',
    'transactionLines',
  ] as const),
) {}
