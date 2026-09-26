import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSalariesTable1775400016000 implements MigrationInterface {
  private table = 'salaries';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'salaryType',
            type: 'enum',
            enum: ['FIXED', 'HOURLY', 'DAILY', 'MONTHLY'],
            isNullable: true,
          },
          {
            name: 'salaryAmount',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_salaries_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
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
