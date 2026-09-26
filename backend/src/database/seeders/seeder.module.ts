import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/app/modules/account/account.module';
import { Client } from 'src/app/modules/factory/client.entity';
import { Branch } from 'src/app/modules/branch/branch.entity';
import { Supplier } from 'src/app/modules/supplier/supplier.entity';
import { Driver } from 'src/app/modules/driver/driver.entity';
import { UserSeederModule } from './user/user-seeder.module';
import { Seeder } from './seeder';
import PostgresTypeorm from 'src/config/db-config';
import { AreaSeederModule } from './area/area-seeder.module';
import { PriceTypeSeederModule } from './price-type/price-type-seeder.module';
import { ClientSeederModule } from './client/client-seeder.module';
import { AccountSeederModule } from './account/account-seeder.module';
import { DriverSeederModule } from './driver/driver-seeder.module';
import { TrailerSeederModule } from './trailer/trailer-seeder.module';
import { CarSeederModule } from './car/car-seeder.module';

/**
 * Import and provide seeder classes.
 *
 * @module
 */
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
    TypeOrmModule.forFeature([Client, Branch, Supplier, Driver]),
    AccountModule,
    UserSeederModule,
    AreaSeederModule,
    PriceTypeSeederModule,
    ClientSeederModule,
    AccountSeederModule,
    DriverSeederModule,
    TrailerSeederModule,
    CarSeederModule,
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
