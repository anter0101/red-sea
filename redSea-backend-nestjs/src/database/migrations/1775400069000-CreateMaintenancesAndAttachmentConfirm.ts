import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMaintenancesAndAttachmentConfirm1775400069000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: 'maintenances',
        columns: [
          idColumn,
          {
            name: 'car_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'trailer_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'maintenance_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_maintenances_car_id',
            columnNames: ['car_id'],
          }),
          new TableIndex({
            name: 'IDX_maintenances_trailer_id',
            columnNames: ['trailer_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'maintenances',
      new TableForeignKey({
        columnNames: ['car_id'],
        referencedTableName: 'cars',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'maintenances',
      new TableForeignKey({
        columnNames: ['trailer_id'],
        referencedTableName: 'trailers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      ALTER TABLE physical_attachments
      ADD COLUMN IF NOT EXISTS "confirmedOk" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "confirmedBy" varchar NULL,
      ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE physical_attachments
      DROP COLUMN IF EXISTS "confirmedOk",
      DROP COLUMN IF EXISTS "confirmedBy",
      DROP COLUMN IF EXISTS "confirmedAt"
    `);
    await queryRunner.dropTable('maintenances', true);
  }
}
