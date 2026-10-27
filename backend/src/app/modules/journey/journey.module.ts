import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from './journey.entity';
import { JourneyController } from './journey.controller';
import { JourneyService } from './journey.service';
import { JourneyAssetsService } from './journey-assets.service';
import { DriverModule } from '../driver/driver.module';
import { CarModule } from '../car/car.module';
import { TrailerModule } from '../trailer/trailer.module';
import { UserModule } from '../user/user.module';
import { JourneyTransactionModule } from '../journey-transaction/journey-transaction.module';
import { ClientModule } from '../factory/client.module';
import { EmployeeModule } from '../employee/employee.module';
import { JourneyStatusEvent } from './journey-status-event.entity';
import { JourneyPolicy } from '../journey-goods/journey-policy.entity';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import { JourneyAttachment } from '../journey-attachment/journey-attachment.entity';
import { AccountModule } from '../account/account.module';
import { CustodyModule } from '../custody/custody.module';
import { DeliveryPrice } from '../delivery-price/delivery-price.entity';
import { JourneyDelegationPrintModule } from '../journey-delegation-print/journey-delegation-print.module';
import { JourneyRevenueService } from './journey-revenue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Journey,
      JourneyPolicy,
      JourneyTransaction,
      JourneyAttachment,
      JourneyStatusEvent,
      DeliveryPrice,
    ]),
    DriverModule,
    CarModule,
    TrailerModule,
    UserModule,
    forwardRef(() => JourneyTransactionModule),
    ClientModule,
    forwardRef(() => EmployeeModule),
    AccountModule,
    forwardRef(() => CustodyModule),
    JourneyDelegationPrintModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService, JourneyAssetsService, JourneyRevenueService],
  exports: [JourneyService, JourneyRevenueService],
})
export class JourneyModule {}
