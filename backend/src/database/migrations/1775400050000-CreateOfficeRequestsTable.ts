import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOfficeRequestsTable1775400050000 implements MigrationInterface {
  private table = 'office_requests';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['PRINT_DELEGATION', 'END_WORKING_SHIFT', 'ASK_FOR_CUSTODY'],
            isNullable: false,
          },
          {
            name: 'journey_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'requested_from_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'requested_to_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_office_requests_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_office_requests_requested_from_id',
            columnNames: ['requested_from_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
          new TableForeignKey({
            name: 'FK_office_requests_requested_to_id',
            columnNames: ['requested_to_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
