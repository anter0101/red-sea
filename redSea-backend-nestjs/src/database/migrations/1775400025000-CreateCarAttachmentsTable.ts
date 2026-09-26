import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCarAttachmentsTable1775400025000 implements MigrationInterface {
  private table = 'car_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'car_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['LICENSE', 'INSURANCE', 'INSPECTION', 'PERMIT', 'OTHER', 'TAX_ID'],
            isNullable: false,
          },
          {
            name: 'documentExpiryDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '255',
            isNullable: false,
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
            name: 'IDX_car_attachments_car_id',
            columnNames: ['car_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_car_attachments_car_id',
            columnNames: ['car_id'],
            referencedTableName: 'cars',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
