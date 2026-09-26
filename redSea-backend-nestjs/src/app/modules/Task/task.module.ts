import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksService } from './task.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gps-sync',
    }),
  ],
  providers: [TasksService],
})
export class TaskModule {}
