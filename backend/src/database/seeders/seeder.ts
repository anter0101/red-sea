import { Injectable, Logger } from '@nestjs/common';
import { UserSeederService } from './user/user-seeder.service';
import { AccountSeederService } from './account/account-seeder.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly userSeederService: UserSeederService,
    private readonly accountSeederService: AccountSeederService,
  ) {}

  async seed() {
    await this.users()
      .then(() => {
        this.logger.debug('Successfully completed seeding users...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding users...');
        throw error;
      });

    await this.accounts()
      .then(() => {
        this.logger.debug('Successfully completed seeding accounts...');
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed seeding accounts...');
        throw error;
      });
  }

  async users() {
    return await Promise.all(this.userSeederService.create())
      .then((createdUsers) => {
        this.logger.debug(
          'No. of users created : ' +
            createdUsers.filter((nullValueOrCreatedUser) => nullValueOrCreatedUser).length,
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
}
