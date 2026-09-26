import { baseColumns } from 'src/core/utils/base.migration';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateDeliveryPricesTable1775400023000 implements MigrationInterface {
  private table = 'delivery_prices';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'client_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'area_id',
            type: 'int4',
            isNullable: false,
          },
          {
            name: 'price_type_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'basePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'additionalFees',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'taxPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'validFrom',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'validTo',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          ...otherBaseColumns,
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_delivery_prices_client_area_price_type_validFrom',
            columnNames: ['client_id', 'area_id', 'price_type_id', 'validFrom'],
          }),
        ],
        indices: [
          new TableIndex({
            name: 'IDX_delivery_prices_lookup',
            columnNames: ['client_id', 'area_id', 'validFrom', 'validTo'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_delivery_prices_client_id',
            columnNames: ['client_id'],
            referencedTableName: 'clients',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_delivery_prices_area_id',
            columnNames: ['area_id'],
            referencedTableName: 'areas',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_delivery_prices_price_type_id',
            columnNames: ['price_type_id'],
            referencedTableName: 'price_types',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
