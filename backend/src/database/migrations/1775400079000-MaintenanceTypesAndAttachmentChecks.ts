import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class MaintenanceTypesAndAttachmentChecks1775400079000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "maintenances"
      ADD COLUMN IF NOT EXISTS "type" varchar(32) NOT NULL DEFAULT 'GENERAL',
      ADD COLUMN IF NOT EXISTS "tire_selections" jsonb NULL
    `);

    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: 'physical_attachment_checks',
        columns: [
          idColumn,
          {
            name: 'physical_attachment_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'checked',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'recorded_at',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'recorded_by',
            type: 'varchar',
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_physical_attachment_checks_attachment_id',
            columnNames: ['physical_attachment_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_physical_attachment_checks_attachment_id"
      ON "physical_attachment_checks" ("physical_attachment_id")
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE t.relname = 'physical_attachment_checks'
            AND c.contype = 'f'
        ) THEN
          ALTER TABLE "physical_attachment_checks"
          ADD CONSTRAINT "FK_physical_attachment_checks_attachment"
          FOREIGN KEY ("physical_attachment_id") REFERENCES "physical_attachments"("id") ON DELETE CASCADE;
        END IF;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('physical_attachment_checks', true);
    await queryRunner.query(`
      ALTER TABLE "maintenances"
      DROP COLUMN IF EXISTS "tire_selections",
      DROP COLUMN IF EXISTS "type"
    `);
  }
}
