import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeederModule } from './database/seeders/seeder.module';
import { DriverSeederService } from './database/seeders/driver/driver-seeder.service';
import { TrailerSeederService } from './database/seeders/trailer/trailer-seeder.service';
import { CarSeederService } from './database/seeders/car/car-seeder.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const logger = appContext.get(Logger);

  try {
    const driverSeeder = appContext.get(DriverSeederService);
    const trailerSeeder = appContext.get(TrailerSeederService);
    const carSeeder = appContext.get(CarSeederService);

    const drivers = await driverSeeder.create();
    logger.debug(
      `Drivers seeded: ${drivers.filter((item) => item).length} created, ${drivers.filter((item) => !item).length} skipped`,
    );

    const trailers = await trailerSeeder.create();
    logger.debug(
      `Trailers seeded: ${trailers.filter((item) => item).length} created, ${trailers.filter((item) => !item).length} skipped`,
    );

    const cars = await carSeeder.create();
    logger.debug(
      `Cars seeded: ${cars.filter((item) => item).length} created, ${cars.filter((item) => !item).length} skipped`,
    );

    logger.debug('Driver, trailer & car seeding complete!');
  } catch (error) {
    logger.error('Vehicle seeding failed!');
    throw error;
  } finally {
    await appContext.close();
  }
}

bootstrap();
