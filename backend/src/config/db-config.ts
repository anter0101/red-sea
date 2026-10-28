import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
export default class PostgresTypeorm implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  // Env values arrive as strings, so "false" must not be read as truthy.
  private flag(key: string, fallback: boolean): boolean {
    const value = this.configService.get<string | boolean>(key);
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return String(value).trim().toLowerCase() === 'true';
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isSslEnabled = this.flag('DATABASE_SSL', false);

    return {
      type: 'postgres',
      logging: this.flag('DATABASE_LOGGING', true),
      synchronize: this.flag('DATABASE_SYNCHRONIZE', false),
      migrationsRun: this.flag('DATABASE_MIGRATIONS_RUN', true),
      entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [path.join(__dirname, '..', 'database/migrations', '**', '*{.ts,.js}')],
      database: this.configService.get<string>('DATABASE_NAME'),
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      ssl: isSslEnabled
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    };
  }
}
