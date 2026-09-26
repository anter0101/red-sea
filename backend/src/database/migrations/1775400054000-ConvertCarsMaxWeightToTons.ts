import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertCarsMaxWeightToTons1775400054000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "cars"
      SET "maxWeight" = ROUND("maxWeight" / 1000.0)
      WHERE "maxWeight" IS NOT NULL AND "maxWeight" > 100
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "cars"
      SET "maxWeight" = "maxWeight" * 1000
      WHERE "maxWeight" IS NOT NULL AND "maxWeight" <= 100
    `);
  }
}
