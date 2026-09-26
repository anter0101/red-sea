import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyTransaction } from './journey-transaction.entity';
import { JourneyTransactionController } from './journey-transaction.controller';
import { JourneyTransactionService } from './journey-transaction.service';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [TypeOrmModule.forFeature([JourneyTransaction]), forwardRef(() => JourneyModule)],
  controllers: [JourneyTransactionController],
  providers: [JourneyTransactionService],
  exports: [JourneyTransactionService],
})
export class JourneyTransactionModule {}
