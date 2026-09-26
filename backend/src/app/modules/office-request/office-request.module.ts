import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeRequest } from './office-request.entity';
import { OfficeRequestController } from './office-request.controller';
import { OfficeRequestService } from './office-request.service';
import { CreateOfficeRequestValidationPipe } from './create-office-request-validation.pipe';
import { JourneyModule } from '../journey/journey.module';
import { EmployeeModule } from '../employee/employee.module';
import { AccountModule } from '../account/account.module';
import { CustodyModule } from '../custody/custody.module';
import { JourneyDelegationPrintModule } from '../journey-delegation-print/journey-delegation-print.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfficeRequest]),
    JourneyModule,
    EmployeeModule,
    AccountModule,
    CustodyModule,
    JourneyDelegationPrintModule,
  ],
  controllers: [OfficeRequestController],
  providers: [OfficeRequestService, CreateOfficeRequestValidationPipe],
  exports: [OfficeRequestService],
})
export class OfficeRequestModule {}
