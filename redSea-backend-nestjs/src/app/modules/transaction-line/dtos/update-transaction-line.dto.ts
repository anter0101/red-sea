import { PartialType } from '@nestjs/swagger';
import { CreateTransactionLineDTO } from './create-transaction-line.dto';

export class UpdateTransactionLineDTO extends PartialType(CreateTransactionLineDTO) {}
