import { TaskModule } from './modules/Task/task.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import PostgresTypeorm from 'src/config/db-config';
import { ContactModule } from './modules/contact/contact.module';
import { SalaryModule } from './modules/salary/salary.module';
import { DriverModule } from './modules/driver/driver.module';
import { CarModule } from './modules/car/car.module';
import { CarAttachmentModule } from './modules/car-attachment/car-attachment.module';
import { PhysicalAttachmentModule } from './modules/physical-attachment/physical-attachment.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { RelTrailerOwnerModule } from './modules/rel-trailer-owner/rel-trailer-owner.module';
import { RelCarOwnerModule } from './modules/rel-car-owner/rel-car-owner.module';
import { AxleModule } from './modules/axle/axle.module';
import { OwnerModule } from './modules/owner/owner.module';
import { TireModule } from './modules/tire/tire.module';
import { TrailerAttachmentModule } from './modules/trailer-attachment/trailer-attachment.module';
import { TrailerModule } from './modules/trailer/trailer.module';
import { ClientModule } from './modules/factory/client.module';
import { BranchModule } from './modules/branch/branch.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { CarManufacturerModule } from './modules/car-manufacturer/car-manufacturer.module';
import { CarModelModule } from './modules/car-model/car-model.module';
import { TireModelModule } from './modules/tire-model/tire-model.module';
import { TrailerManufacturerModule } from './modules/trailer-manufacturer/trailer-manufacturer.module';
import { GridModule } from './modules/grid/grid.module';
import { JourneyModule } from './modules/journey/journey.module';
import { GovernmentModule } from './modules/government/government.module';
import { AreaModule } from './modules/area/area.module';
import { JourneyPolicyModule } from './modules/journey-goods/journey-policy.module';
import { JourneyAttachmentModule } from './modules/journey-attachment/journey-attachment.module';
import { JourneyTransactionModule } from './modules/journey-transaction/journey-transaction.module';
import { UploadModule } from './modules/upload/upload.module';
import { DeliveryPriceModule } from './modules/delivery-price/delivery-price.module';
import { PriceTypeModule } from './modules/price-type/price-type.module';
import { UserAttachmentModule } from './modules/user-attachment/user-attachment.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { GpsDeviceModule } from './modules/gps-device/gps-device.module';
import { GpsTailModule } from './modules/gps-tail/gps-tail.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { GpsQueueModule } from './modules/gps-queue/gps-queue.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TransactionLineModule } from './modules/transaction-line/transaction-line.module';
import { AccountModule } from './modules/account/account.module';
import { FinancialStatsModule } from './modules/financial-stats/financial-stats.module';
import { CustodyModule } from './modules/custody/custody.module';
import { OfficeRequestModule } from './modules/office-request/office-request.module';
import { JourneyDelegationPrintModule } from './modules/journey-delegation-print/journey-delegation-print.module';
import { I18nModule } from '../i18n/i18n.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresTypeorm,
      inject: [PostgresTypeorm],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    GpsQueueModule,
    ScheduleModule.forRoot(),
    TaskModule,
    AuthModule,
    UserModule,
    ContactModule,
    SalaryModule,
    DriverModule,
    CarModule,
    CarAttachmentModule,
    PhysicalAttachmentModule,
    MaintenanceModule,
    AxleModule,
    RelCarOwnerModule,
    RelTrailerOwnerModule,
    OwnerModule,
    TireModule,
    TrailerModule,
    TrailerAttachmentModule,
    ClientModule,
    BranchModule,
    EmployeeModule,
    CarModelModule,
    CarManufacturerModule,
    TireModelModule,
    TrailerManufacturerModule,
    TireModule,
    GridModule,
    JourneyModule,
    GovernmentModule,
    AreaModule,
    JourneyPolicyModule,
    JourneyTransactionModule,
    JourneyAttachmentModule,
    UserAttachmentModule,
    UploadModule,
    DeliveryPriceModule,
    PriceTypeModule,
    WarehouseModule,
    SupplierModule,
    GpsDeviceModule,
    GpsTailModule,
    TransactionModule,
    TransactionLineModule,
    AccountModule,
    FinancialStatsModule,
    CustodyModule,
    OfficeRequestModule,
    JourneyDelegationPrintModule,
    I18nModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
