import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCarModelsTable1775400013000 implements MigrationInterface {
  private table = 'car_model';

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
            isNullable: false,
          },
          {
            name: 'manufacturerId',
            type: 'int4',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_car_model_manufacturer',
            columnNames: ['manufacturerId'],
            referencedTableName: 'car_manufacturer',
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
