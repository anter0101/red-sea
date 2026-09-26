import { Module } from '@nestjs/common';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from './salary.entity';
import { SalaryWorkDay } from './salary-work-day.entity';
import { SalaryJourneyCommission } from './salary-journey-commission.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salary, SalaryWorkDay, SalaryJourneyCommission, User]),
    UserModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
