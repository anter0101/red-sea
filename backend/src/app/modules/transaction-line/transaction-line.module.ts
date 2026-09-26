import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLine } from './transaction-line.entity';
import { AccountModule } from '../account/account.module';
import { TransactionLineController } from './transaction-line.controller';
import { TransactionLineService } from './transaction-line.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLine]), forwardRef(() => AccountModule)],
  controllers: [TransactionLineController],
  providers: [TransactionLineService],
  exports: [TransactionLineService],
})
export class TransactionLineModule {}
