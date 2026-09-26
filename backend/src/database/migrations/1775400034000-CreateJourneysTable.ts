import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateJourneysTable1775400034000 implements MigrationInterface {
  private table = 'journeys';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'delegateNumber',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'delegateDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'tripStatus',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'driver_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'assistant_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'car_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'client_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'trailer_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'direction',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'cementGrade',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'packingType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'sellingOrderNo',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'receivedCompany',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'custody_source_id',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journeys_driver_id',
            columnNames: ['driver_id'],
            referencedTableName: 'drivers',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journeys_assistant_id',
            columnNames: ['assistant_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journeys_car_id',
            columnNames: ['car_id'],
            referencedTableName: 'cars',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journeys_client_id',
            columnNames: ['client_id'],
            referencedTableName: 'clients',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journeys_trailer_id',
            columnNames: ['trailer_id'],
            referencedTableName: 'trailers',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journeys_custody_source_id',
            columnNames: ['custody_source_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
