import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateInvoicesTable1775400078000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = () => baseColumns.map((column) => ({ ...column }));
    const [idColumn, ...otherBaseColumns] = columns();
    const [journeyIdColumn, ...journeyBaseColumns] = columns();

    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          idColumn,
          { name: 'code', type: 'varchar', length: '50', isNullable: false, isUnique: true },
          { name: 'client_id', type: 'int4', isNullable: false },
          { name: 'date', type: 'date', isNullable: false },
          { name: 'tax_enabled', type: 'boolean', isNullable: false, default: false },
          {
            name: 'vat_percentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'withholding_percentage',
            type: 'numeric',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          { name: 'total_revenue', type: 'numeric', precision: 14, scale: 2, isNullable: false },
          { name: 'vat_amount', type: 'numeric', precision: 14, scale: 2, isNullable: false },
          {
            name: 'withholding_amount',
            type: 'numeric',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          { name: 'net_amount', type: 'numeric', precision: 14, scale: 2, isNullable: false },
          { name: 'transaction_id', type: 'int4', isNullable: true },
          ...otherBaseColumns,
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        name: 'FK_invoices_client',
        columnNames: ['client_id'],
        referencedTableName: 'clients',
        referencedColumnNames: ['id'],
      }),
    );
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        name: 'FK_invoices_transaction',
        columnNames: ['transaction_id'],
        referencedTableName: 'transactions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createIndex(
      'invoices',
      new TableIndex({ name: 'IDX_invoices_client_id', columnNames: ['client_id'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'invoice_journeys',
        columns: [
          journeyIdColumn,
          { name: 'invoice_id', type: 'int4', isNullable: false },
          { name: 'journey_id', type: 'int4', isNullable: false, isUnique: true },
          { name: 'revenue_amount', type: 'numeric', precision: 14, scale: 2, isNullable: false },
          ...journeyBaseColumns,
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'invoice_journeys',
      new TableForeignKey({
        name: 'FK_invoice_journeys_invoice',
        columnNames: ['invoice_id'],
        referencedTableName: 'invoices',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'invoice_journeys',
      new TableForeignKey({
        name: 'FK_invoice_journeys_journey',
        columnNames: ['journey_id'],
        referencedTableName: 'journeys',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('invoice_journeys');
    await queryRunner.dropTable('invoices');
  }
}
