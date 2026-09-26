import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSuppliersTable1775400009000 implements MigrationInterface {
  private table = 'suppliers';

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
            name: 'activity',
            type: 'enum',
            enum: ['TRANSPORT', 'SPARE_PARTS'],
            isNullable: false,
          },
          {
            name: 'governorate',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'commercialRegister',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'taxCard',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'taxRegistrationNumber',
            type: 'varchar',
            length: '50',
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
