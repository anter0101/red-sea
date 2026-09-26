import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTransactionsTable1775400024000 implements MigrationInterface {
  private table = 'transactions';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
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
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'POSTED', 'CANCELLED'],
            default: "'DRAFT'",
            isNullable: false,
          },
          {
            name: 'journal_id',
            type: 'int4',
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_transactions_journal_id',
            columnNames: ['journal_id'],
            referencedTableName: 'journals',
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
