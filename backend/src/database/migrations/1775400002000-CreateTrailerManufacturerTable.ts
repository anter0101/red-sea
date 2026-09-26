import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTrailerManufacturerTable1775400002000 implements MigrationInterface {
  private table = 'trailer_manufacturer';

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
            length: '100',
            isUnique: true,
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
