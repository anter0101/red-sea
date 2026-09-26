import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCustodiesTable1775400045000 implements MigrationInterface {
  private table = 'custodies';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'employee_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'account_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'current_balance',
            type: 'decimal',
            precision: 14,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
            enumName: 'custody_status_enum',
            default: "'ACTIVE'",
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_custodies_employee_id',
            columnNames: ['employee_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
          new TableForeignKey({
            name: 'FK_custodies_account_id',
            columnNames: ['account_id'],
            referencedTableName: 'accounts',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
    await queryRunner.query('DROP TYPE IF EXISTS "custody_status_enum"');
  }
}
