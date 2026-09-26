import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAxlesTable1775400027000 implements MigrationInterface {
  private table = 'axles';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'number',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'carId',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'trailerId',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_axles_car_id',
            columnNames: ['carId'],
            referencedTableName: 'cars',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_axles_trailer_id',
            columnNames: ['trailerId'],
            referencedTableName: 'trailers',
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
