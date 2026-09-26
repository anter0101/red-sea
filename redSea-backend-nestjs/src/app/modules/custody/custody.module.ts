import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustodyController } from './custody.controller';
import { CustodyService } from './custody.service';
import { Custody } from './custody.entity';
import { EmployeeModule } from '../employee/employee.module';
import { AccountModule } from '../account/account.module';
import { Journey } from '../journey/journey.entity';
import { JourneyModule } from '../journey/journey.module';
import { Driver } from '../driver/driver.entity';
import { DriverModule } from '../driver/driver.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Custody, Journey, Driver]),
    forwardRef(() => EmployeeModule),
    AccountModule,
    forwardRef(() => JourneyModule),
    DriverModule,
  ],
  controllers: [CustodyController],
  providers: [CustodyService],
  exports: [CustodyService],
})
export class CustodyModule {}
