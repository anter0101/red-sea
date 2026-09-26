import { baseColumns } from 'src/core/utils/base.migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Single Table Inheritance (STI) — all child entities (Maintenance, Utility,
 * TaxFee, Penalty, Incentive, Exceptional, Custody) share this one table.
 * Child-only columns are nullable since only one sub-type populates them.
 */
export class CreateExpensesTable1775400039000 implements MigrationInterface {
  private table = 'expenses';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [idColumn, ...otherBaseColumns] = baseColumns;

    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [
          idColumn,

          // ── Base Expense columns ───────────────────────────────────────
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'monthlyRecurring',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'APPROVED', 'POSTED', 'REJECTED', 'CANCELLED'],
            enumName: 'expense_status_enum',
            default: "'DRAFT'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            // STI discriminator column — stores the ExpenseType value
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'employee_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'car_id',
            type: 'int4',
            isNullable: true,
          },

          // ── MaintenanceExpense child columns ───────────────────────────
          {
            name: 'maintenanceType',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'center',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'partName',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'partSource',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'consumable',
            type: 'boolean',
            default: false,
            isNullable: true,
          },

          // ── UtilityExpense child columns ───────────────────────────────
          {
            name: 'serviceType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'place',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },

          // ── TaxFeeExpense child columns ────────────────────────────────
          {
            name: 'feeType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'expiryDate',
            type: 'date',
            isNullable: true,
          },

          // ── ExceptionalExpense child columns ───────────────────────────
          {
            name: 'subType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'beneficiary',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },

          ...otherBaseColumns,
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'FK_expenses_employee_id',
            columnNames: ['employee_id'],
            referencedTableName: 'employees',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
          }),
          new TableForeignKey({
            name: 'FK_expenses_car_id',
            columnNames: ['car_id'],
            referencedTableName: 'cars',
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
