import { Injectable, Logger } from '@nestjs/common';
import { UserSeederService } from './user/user-seeder.service';
import { AreaSeederService } from './area/area-seeder.service';
import { PriceTypeSeederService } from './price-type/price-type-seeder.service';
import { ClientSeederService } from './client/client-seeder.service';
import { AccountSeederService } from './account/account-seeder.service';
import { DriverSeederService } from './driver/driver-seeder.service';
import { TrailerSeederService } from './trailer/trailer-seeder.service';
import { CarSeederService } from './car/car-seeder.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly userSeederService: UserSeederService,
    private readonly areaSeederService: AreaSeederService,
    private readonly priceTypeSeederService: PriceTypeSeederService,
    private readonly clientSeederService: ClientSeederService,
    private readonly accountSeederService: AccountSeederService,
    private readonly driverSeederService: DriverSeederService,
    private readonly trailerSeederService: TrailerSeederService,
    private readonly carSeederService: CarSeederService,
  ) {}
  async seed() {
    // Seed Users
    await this.users()
      .then(() => {
        this.logger.debug('Successfully completed seeding users...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding users...');
        throw error;
      });

    // Seed Areas
    await this.areas()
      .then(() => {
        this.logger.debug('Successfully completed seeding areas...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding areas...');
        throw error;
      });

    // Seed Price Types
    await this.priceTypes()
      .then(() => {
        this.logger.debug('Successfully completed seeding price types...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding price types...');
        throw error;
      });

    // Seed Clients
    await this.clients()
      .then(() => {
        this.logger.debug('Successfully completed seeding clients...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding clients...');
        throw error;
      });

    // Seed Accounts (Chart of Accounts)
    await this.accounts()
      .then(() => {
        this.logger.debug('Successfully completed seeding accounts...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding accounts...');
        throw error;
      });

    // Seed Drivers
    await this.drivers()
      .then(() => {
        this.logger.debug('Successfully completed seeding drivers...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding drivers...');
        throw error;
      });

    // Seed Trailers
    await this.trailers()
      .then(() => {
        this.logger.debug('Successfully completed seeding trailers...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding trailers...');
        throw error;
      });

    // Seed Cars
    await this.cars()
      .then(() => {
        this.logger.debug('Successfully completed seeding cars...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding cars...');
        throw error;
      });
  }

  async users() {
    return await Promise.all(this.userSeederService.create())
      .then((createdUsers) => {
        // Can also use this.logger.verbose('...');
        this.logger.debug(
          'No. of users created : ' +
            // Remove all null values and return only created users.
            createdUsers.filter((nullValueOrCreatedUser) => nullValueOrCreatedUser).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async areas() {
    return await this.areaSeederService
      .create()
      .then((createdAreas) => {
        this.logger.debug(
          'No. of areas created : ' +
            createdAreas.filter((nullValueOrCreatedArea) => nullValueOrCreatedArea).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async priceTypes() {
    return await this.priceTypeSeederService
      .create()
      .then((createdPriceTypes) => {
        this.logger.debug(
          'No. of price types created : ' +
            createdPriceTypes.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async clients() {
    return await this.clientSeederService
      .create()
      .then((createdClients) => {
        this.logger.debug(
          'No. of clients created : ' +
            createdClients.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async accounts() {
    return await this.accountSeederService
      .create()
      .then((created) => {
        this.logger.debug(
          'No. of accounts created : ' +
            created.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async drivers() {
    return await this.driverSeederService
      .create()
      .then((created) => {
        this.logger.debug(
          'No. of drivers created : ' +
            created.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async trailers() {
    return await this.trailerSeederService
      .create()
      .then((created) => {
        this.logger.debug(
          'No. of trailers created : ' +
            created.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  async cars() {
    return await this.carSeederService
      .create()
      .then((created) => {
        this.logger.debug(
          'No. of cars created : ' +
            created.filter((nullValueOrCreated) => nullValueOrCreated).length,
        );
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }
}
