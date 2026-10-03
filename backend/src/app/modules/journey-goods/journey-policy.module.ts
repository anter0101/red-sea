import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyModule } from '../journey/journey.module';
import { JourneyPolicy } from './journey-policy.entity';
import { JourneyPolicyController } from './journey-policy.controller';
import { JourneyPolicyService } from './journey-policy.service';
import { GovernmentModule } from '../government/government.module';
import { AreaModule } from '../area/area.module';
import { EmployeeModule } from '../employee/employee.module';
import { JourneyAttachmentModule } from '../journey-attachment/journey-attachment.module';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';
import { Journey } from '../journey/journey.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { Supplier } from '../supplier/supplier.entity';
import { Employee } from '../employee/employee.entity';
import { Transaction } from '../transaction/transaction.entity';
import { PolicyLedgerService } from './policy-ledger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JourneyPolicy,
      Journey,
      JourneyTransaction,
      Supplier,
      Employee,
      Transaction,
    ]),
    JourneyModule,
    GovernmentModule,
    AreaModule,
    EmployeeModule,
    JourneyAttachmentModule,
    AccountModule,
    TransactionModule,
  ],
  controllers: [JourneyPolicyController],
  providers: [JourneyPolicyService, PolicyLedgerService],
  exports: [JourneyPolicyService, PolicyLedgerService],
})
export class JourneyPolicyModule {}
