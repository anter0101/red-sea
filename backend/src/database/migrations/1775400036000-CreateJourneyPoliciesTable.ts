import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateJourneyPoliciesTable1775400036000 implements MigrationInterface {
  private table = 'journey_policies';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'journey_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'bookWeight',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'actualWeight',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'deliveryWeight',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'shortageQty',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'policyNo',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'policyDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'entryTimeFactory',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'exitTimeFactory',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivery_gov_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'delivery_area_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'loadingDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'loadingPermitNo',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'archiveNo',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'employee_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'tripDuration',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'tripDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'trip_distance',
            type: 'float',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journey_policies_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_journey_policies_delivery_gov_id',
            columnNames: ['delivery_gov_id'],
            referencedTableName: 'governments',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journey_policies_delivery_area_id',
            columnNames: ['delivery_area_id'],
            referencedTableName: 'areas',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_journey_policies_employee_id',
            columnNames: ['employee_id'],
            referencedTableName: 'employees',
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
