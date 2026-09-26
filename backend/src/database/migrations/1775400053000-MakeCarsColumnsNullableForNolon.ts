import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCarsColumnsNullableForNolon1775400053000 implements MigrationInterface {
  private readonly nullableColumns = [
    'manufacturer',
    'model',
    '"manufactureYear"',
    'color',
    'cylinders',
    'horsepower',
    '"axleCount"',
    '"maxWeight"',
    '"chassisNumber"',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.nullableColumns) {
      await queryRunner.query(`ALTER TABLE "cars" ALTER COLUMN ${column} DROP NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of this.nullableColumns) {
      await queryRunner.query(`ALTER TABLE "cars" ALTER COLUMN ${column} SET NOT NULL`);
    }
  }
}
