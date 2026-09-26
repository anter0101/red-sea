import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { BranchModule } from '../branch/branch.module';
import { AccountModule } from '../account/account.module';
import { ContactModule } from '../contact/contact.module';
import { SalaryModule } from '../salary/salary.module';
import { CustodyModule } from '../custody/custody.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, User]),
    UserModule,
    BranchModule,
    AccountModule,
    ContactModule,
    SalaryModule,
    forwardRef(() => CustodyModule),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
