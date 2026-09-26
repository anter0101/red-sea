import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTrailerAttachmentsTable1775400026000 implements MigrationInterface {
  private table = 'trailer_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'trailer_id',
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
            name: 'IDX_trailer_attachments_trailer_id',
            columnNames: ['trailer_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_trailer_attachments_trailer_id',
            columnNames: ['trailer_id'],
            referencedTableName: 'trailers',
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
