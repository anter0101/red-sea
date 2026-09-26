import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateSupplierActivityToType1775400057000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('suppliers'))) {
      return;
    }

    const hasActivity = await queryRunner.hasColumn('suppliers', 'activity');
    const hasType = await queryRunner.hasColumn('suppliers', 'type');

    if (!hasActivity || hasType) {
      return;
    }

    await queryRunner.query(`
      CREATE TYPE "supplier_type_enum" AS ENUM ('GOODS', 'SERVICES', 'TRANSPORTATION')
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ADD COLUMN "type" "supplier_type_enum"
    `);

    await queryRunner.query(`
      UPDATE "suppliers"
      SET "type" = CASE
        WHEN "activity"::text = 'TRANSPORT' THEN 'TRANSPORTATION'::"supplier_type_enum"
        WHEN "activity"::text = 'SPARE_PARTS' THEN 'GOODS'::"supplier_type_enum"
        ELSE 'GOODS'::"supplier_type_enum"
      END
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ALTER COLUMN "type" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      DROP COLUMN "activity"
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "suppliers_activity_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('suppliers'))) {
      return;
    }

    const hasType = await queryRunner.hasColumn('suppliers', 'type');
    const hasActivity = await queryRunner.hasColumn('suppliers', 'activity');

    if (!hasType || hasActivity) {
      return;
    }

    await queryRunner.query(`
      CREATE TYPE "suppliers_activity_enum" AS ENUM ('TRANSPORT', 'SPARE_PARTS')
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ADD COLUMN "activity" "suppliers_activity_enum"
    `);

    await queryRunner.query(`
      UPDATE "suppliers"
      SET "activity" = CASE
        WHEN "type"::text = 'TRANSPORTATION' THEN 'TRANSPORT'::"suppliers_activity_enum"
        WHEN "type"::text = 'SERVICES' THEN 'SPARE_PARTS'::"suppliers_activity_enum"
        ELSE 'SPARE_PARTS'::"suppliers_activity_enum"
      END
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ALTER COLUMN "activity" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      DROP COLUMN "type"
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "supplier_type_enum"`);
  }
}
