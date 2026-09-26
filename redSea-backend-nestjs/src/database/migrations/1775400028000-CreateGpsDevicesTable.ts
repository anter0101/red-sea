import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateGpsDevicesTable1775400028000 implements MigrationInterface {
  private table = 'gps_devices';

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
            length: '150',
            isNullable: false,
          },
          {
            name: 'imei',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'lastLatitude',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'lastLongitude',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'speed',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'totalDistance',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'batteryLevel',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'signalStrength',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'engineStatus',
            type: 'boolean',
            default: false,
            isNullable: true,
          },
          {
            name: 'lastUpdate',
            type: 'timestamp without time zone',
            isNullable: true,
          },
          {
            name: 'carId',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_gps_devices_imei',
            columnNames: ['imei'],
            isUnique: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_gps_devices_car_id',
            columnNames: ['carId'],
            referencedTableName: 'cars',
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
