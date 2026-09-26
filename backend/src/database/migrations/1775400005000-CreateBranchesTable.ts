import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBranchesTable1775400005000 implements MigrationInterface {
  private table = 'branches';

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
            length: '255',
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
