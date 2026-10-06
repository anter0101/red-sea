import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { CompanySettings } from '../company-settings/company-settings.entity';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';
import { Journey } from '../journey/journey.entity';
import { Transaction } from '../transaction/transaction.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceJourney } from './invoice-journey.entity';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceJourney,
      Journey,
      Transaction,
      CompanySettings,
      DeliveryPrice,
    ]),
    AccountModule,
    TransactionModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
