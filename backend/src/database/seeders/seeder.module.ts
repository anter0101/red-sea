import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
