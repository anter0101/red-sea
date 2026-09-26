import { Module, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionLineModule } from '../transaction-line/transaction-line.module';
import { TransactionController } from './transaction.controller';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    TransactionLineModule,
    forwardRef(() => AccountModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
