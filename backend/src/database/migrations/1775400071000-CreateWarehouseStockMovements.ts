import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWarehouseStockMovements1775400071000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('warehouse_stock_movements')) {
      return;
    }

    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.query(`
      CREATE TYPE "warehouse_stock_movement_type_enum" AS ENUM ('IN', 'OUT', 'ADJUST')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'warehouse_stock_movements',
        columns: [
          idColumn,
          {
            name: 'warehouse_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'warehouse_stock_movement_type_enum',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'quantity_before',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'quantity_after',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'IDX_warehouse_stock_movements_warehouse_id',
            columnNames: ['warehouse_id'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'warehouse_stock_movements',
      new TableForeignKey({
        columnNames: ['warehouse_id'],
        referencedTableName: 'warehouses',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('warehouse_stock_movements'))) {
      return;
    }

    const table = await queryRunner.getTable('warehouse_stock_movements');
    const fk = table?.foreignKeys.find((f) => f.columnNames.includes('warehouse_id'));
    if (fk) {
      await queryRunner.dropForeignKey('warehouse_stock_movements', fk);
    }

    await queryRunner.dropTable('warehouse_stock_movements');
    await queryRunner.query(`DROP TYPE IF EXISTS "warehouse_stock_movement_type_enum"`);
  }
}
