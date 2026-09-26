import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTrailersMaxWeightToTons1775400055000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "trailers"
      SET "maxWeight" = ROUND("maxWeight" / 1000.0)
      WHERE "maxWeight" IS NOT NULL AND "maxWeight" > 100
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "trailers"
      SET "maxWeight" = "maxWeight" * 1000
      WHERE "maxWeight" IS NOT NULL AND "maxWeight" <= 100
    `);
  }
}
