import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateExpenseAttachmentsTable1775400040000 implements MigrationInterface {
  private table = 'expense_attachments';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'expense_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['invoice', 'receipt', 'contract', 'bill', 'warranty', 'other'],
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'documentExpiryDate',
            type: 'date',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_expense_attachments_expense_id',
            columnNames: ['expense_id'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_expense_attachments_expense_id',
            columnNames: ['expense_id'],
            referencedTableName: 'expenses',
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
