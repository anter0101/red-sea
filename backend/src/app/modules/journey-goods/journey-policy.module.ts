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

@Module({
  imports: [
    TypeOrmModule.forFeature([JourneyPolicy]),
    JourneyModule,
    GovernmentModule,
    AreaModule,
    EmployeeModule,
    JourneyAttachmentModule,
  ],
  controllers: [JourneyPolicyController],
  providers: [JourneyPolicyService],
  exports: [JourneyPolicyService],
})
export class JourneyPolicyModule {}
