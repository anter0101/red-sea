import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJourneyTransactionsTable1775400037000 implements MigrationInterface {
  private table = 'journey_transactions';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,
          {
            name: 'journey_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'transactionType',
            type: 'enum',
            enum: ['EXPENSE', 'REVENUE', 'ADVANCE'],
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'Office Fees',
              'Loading Fees',
              'Weighing Fees',
              'Card Fees',
              'Toll Fees',
              'Crossing Fees',
              'Port Permit Fees',
              'Port Fees',
              'Diesel Fees',
              'Other Expenses',
              'Custody',
            ],
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'unitPrice',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'placeOrService',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'invoiceUrl',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'float',
            isNullable: false,
          },
          ...otherBaseColumns,
        ],
        indices: [
          new TableIndex({
            name: 'uniq_journey_category',
            columnNames: ['journey_id', 'category'],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_journey_transactions_journey_id',
            columnNames: ['journey_id'],
            referencedTableName: 'journeys',
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
