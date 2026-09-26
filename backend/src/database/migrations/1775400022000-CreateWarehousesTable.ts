import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWarehousesTable1775400022000 implements MigrationInterface {
  private table = 'warehouses';

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
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'condition',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'alertQuantity',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'supplier_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'unitPrice',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'manufacturingYear',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'purchaseDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expiryDate',
            type: 'date',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_warehouses_name',
            columnNames: ['name'],
            isUnique: true,
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_warehouses_supplier_id',
            columnNames: ['supplier_id'],
            referencedTableName: 'suppliers',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
