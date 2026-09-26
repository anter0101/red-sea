import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateClientsTable1775400008000 implements MigrationInterface {
  private table = 'clients';

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
          {
            name: 'commercialRecord',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'taxInvoice',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'companyCode',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'destinationsFile',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_clients_name',
            columnNames: ['name'],
            isUnique: true,
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
