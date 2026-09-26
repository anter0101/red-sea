import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTransactionLinesTable1775400031000 implements MigrationInterface {
  private table = 'transaction_lines';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'transaction_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'account_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'entryType',
            type: 'enum',
            enum: ['DEBIT', 'CREDIT'],
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
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
            name: 'FK_transaction_lines_transaction_id',
            columnNames: ['transaction_id'],
            referencedTableName: 'transactions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            name: 'FK_transaction_lines_account_id',
            columnNames: ['account_id'],
            referencedTableName: 'accounts',
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
