import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStockMovementSnapshotFields1775400072000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('warehouse_stock_movements'))) {
      return;
    }

    const addIfMissing = async (column: TableColumn) => {
      if (!(await queryRunner.hasColumn('warehouse_stock_movements', column.name))) {
        await queryRunner.addColumn('warehouse_stock_movements', column);
      }
    };

    await addIfMissing(
      new TableColumn({
        name: 'unit',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'unit_price',
        type: 'float',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'weight_note',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'condition',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'manufacturing_year',
        type: 'int4',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'purchase_date',
        type: 'date',
        isNullable: true,
      }),
    );
    await addIfMissing(
      new TableColumn({
        name: 'expiry_date',
        type: 'date',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('warehouse_stock_movements'))) {
      return;
    }

    for (const name of [
      'expiry_date',
      'purchase_date',
      'manufacturing_year',
      'condition',
      'weight_note',
      'unit_price',
      'unit',
    ]) {
      if (await queryRunner.hasColumn('warehouse_stock_movements', name)) {
        await queryRunner.dropColumn('warehouse_stock_movements', name);
      }
    }
  }
}
