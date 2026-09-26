import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePhysicalAttachmentsTable1775400059000 implements MigrationInterface {
  private table = 'physical_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'photoUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
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
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_physical_attachments_car_id',
            columnNames: ['car_id'],
          }),
          new TableIndex({
            name: 'IDX_physical_attachments_trailer_id',
            columnNames: ['trailer_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_physical_attachments_car_id',
            columnNames: ['car_id'],
            referencedTableName: 'cars',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_physical_attachments_trailer_id',
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
