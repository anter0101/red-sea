import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeederModule } from './user/user-seeder.module';
import { Seeder } from './seeder';
import PostgresTypeorm from 'src/config/db-config';
import { AccountSeederModule } from './account/account-seeder.module';

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
    AccountSeederModule,
  ],
  providers: [Logger, Seeder],
})
export class SeederModule {}
