import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTiresTable1775400032000 implements MigrationInterface {
  private table = 'tires';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'serialNumber',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'healthPercentage',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'createdDate',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'axleId',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_tires_axle_id',
            columnNames: ['axleId'],
            referencedTableName: 'axles',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
