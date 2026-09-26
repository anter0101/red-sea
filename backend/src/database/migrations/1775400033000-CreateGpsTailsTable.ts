import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateGpsTailsTable1775400033000 implements MigrationInterface {
  private table = 'gps_tails';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'device_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'sequenceOrder',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'timestamp',
            type: 'timestamp without time zone',
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_gps_tails_device_id',
            columnNames: ['device_id'],
            referencedTableName: 'gps_devices',
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
