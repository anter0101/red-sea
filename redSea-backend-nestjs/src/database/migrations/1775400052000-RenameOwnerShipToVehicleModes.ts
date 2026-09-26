import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aligns cars/trailers ownerShip values with journey vehicle modes
 * (RENT→NOLON_CAR, Factory→CONTRACT_CAR, OWN→COMPANY_CAR).
 */
export class RenameOwnerShipToVehicleModes1775400052000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['cars', 'trailers']) {
      if (!(await queryRunner.hasTable(table))) {
        continue;
      }
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'NOLON_CAR' WHERE "ownerShip" = 'RENT'`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'CONTRACT_CAR' WHERE "ownerShip" = 'Factory'`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'COMPANY_CAR' WHERE "ownerShip" = 'OWN'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['cars', 'trailers']) {
      if (!(await queryRunner.hasTable(table))) {
        continue;
      }
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'RENT' WHERE "ownerShip" = 'NOLON_CAR'`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'Factory' WHERE "ownerShip" = 'CONTRACT_CAR'`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "ownerShip" = 'OWN' WHERE "ownerShip" = 'COMPANY_CAR'`,
      );
    }
  }
}
