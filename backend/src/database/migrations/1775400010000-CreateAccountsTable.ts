import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/** accounts is self-referencing: parent_account_id FK is added after table creation. */
export class CreateAccountsTable1775400010000 implements MigrationInterface {
  private table = 'accounts';

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
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CASH'],
            isNullable: false,
          },
          {
            name: 'normalBalance',
            type: 'enum',
            enum: ['DEBIT', 'CREDIT'],
            isNullable: false,
          },
          {
            name: 'parent_account_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'isLeaf',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
      }),
    );

    // Self-referencing FK added after table exists
    await queryRunner.createForeignKey(
      this.table,
      new TableForeignKey({
        name: 'FK_accounts_parent_account_id',
        columnNames: ['parent_account_id'],
        referencedTableName: this.table,
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table, 'FK_accounts_parent_account_id');
    await queryRunner.dropTable(this.table);
  }
}
