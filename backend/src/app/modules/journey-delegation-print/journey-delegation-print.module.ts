import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyDelegationPrint } from './journey-delegation-print.entity';
import { JourneyDelegationPrintController } from './journey-delegation-print.controller';
import { JourneyDelegationPrintService } from './journey-delegation-print.service';
import { Journey } from '../journey/journey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JourneyDelegationPrint, Journey])],
  controllers: [JourneyDelegationPrintController],
  providers: [JourneyDelegationPrintService],
  exports: [JourneyDelegationPrintService],
})
export class JourneyDelegationPrintModule {}
