import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTrailersColumnsNullableForNolon1775400058000 implements MigrationInterface {
  private readonly nullableColumns = [
    '"chaseType"',
    'manufacturer',
    '"manufactureYear"',
    'color',
    '"maxWeight"',
    '"chassisNumber"',
    '"axleCount"',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.nullableColumns) {
      await queryRunner.query(`ALTER TABLE "trailers" ALTER COLUMN ${column} DROP NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.nullableColumns) {
      await queryRunner.query(`ALTER TABLE "trailers" ALTER COLUMN ${column} SET NOT NULL`);
    }
  }
}
