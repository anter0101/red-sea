import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class SupplierGovernmentFkDropCity1775400070000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('suppliers'))) {
      return;
    }

    const hasGovernmentId = await queryRunner.hasColumn('suppliers', 'government_id');
    if (!hasGovernmentId) {
      await queryRunner.addColumn(
        'suppliers',
        new TableColumn({
          name: 'government_id',
          type: 'int4',
          isNullable: true,
        }),
      );
    }

    // Best-effort map free-text governorate → governments.id by name
    if (await queryRunner.hasColumn('suppliers', 'governorate')) {
      await queryRunner.query(`
        UPDATE "suppliers" s
        SET "government_id" = g.id
        FROM "governments" g
        WHERE s."government_id" IS NULL
          AND TRIM(s."governorate") <> ''
          AND (
            TRIM(s."governorate") = g.name
            OR TRIM(s."governorate") ILIKE g.name
          )
      `);
    }

    // Fallback unmatched rows to the first government (if any)
    await queryRunner.query(`
      UPDATE "suppliers"
      SET "government_id" = (SELECT id FROM "governments" ORDER BY id ASC LIMIT 1)
      WHERE "government_id" IS NULL
        AND EXISTS (SELECT 1 FROM "governments")
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ALTER COLUMN "government_id" SET NOT NULL
    `);

    const table = await queryRunner.getTable('suppliers');
    const existingFk = table?.foreignKeys.find((fk) => fk.columnNames.includes('government_id'));
    if (!existingFk) {
      await queryRunner.createForeignKey(
        'suppliers',
        new TableForeignKey({
          columnNames: ['government_id'],
          referencedTableName: 'governments',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
        }),
      );
    }

    if (await queryRunner.hasColumn('suppliers', 'city')) {
      await queryRunner.dropColumn('suppliers', 'city');
    }

    if (await queryRunner.hasColumn('suppliers', 'governorate')) {
      await queryRunner.dropColumn('suppliers', 'governorate');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('suppliers'))) {
      return;
    }

    if (!(await queryRunner.hasColumn('suppliers', 'governorate'))) {
      await queryRunner.addColumn(
        'suppliers',
        new TableColumn({
          name: 'governorate',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn('suppliers', 'city'))) {
      await queryRunner.addColumn(
        'suppliers',
        new TableColumn({
          name: 'city',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    if (await queryRunner.hasColumn('suppliers', 'government_id')) {
      await queryRunner.query(`
        UPDATE "suppliers" s
        SET "governorate" = g.name
        FROM "governments" g
        WHERE s."government_id" = g.id
          AND (s."governorate" IS NULL OR s."governorate" = '')
      `);

      await queryRunner.query(`
        UPDATE "suppliers"
        SET "governorate" = COALESCE("governorate", ''),
            "city" = COALESCE("city", '')
      `);

      await queryRunner.query(`
        ALTER TABLE "suppliers"
        ALTER COLUMN "governorate" SET NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "suppliers"
        ALTER COLUMN "city" SET NOT NULL
      `);

      const table = await queryRunner.getTable('suppliers');
      const fk = table?.foreignKeys.find((f) => f.columnNames.includes('government_id'));
      if (fk) {
        await queryRunner.dropForeignKey('suppliers', fk);
      }

      await queryRunner.dropColumn('suppliers', 'government_id');
    }
  }
}
